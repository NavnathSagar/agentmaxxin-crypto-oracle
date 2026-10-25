
import fs from "fs";
import path from "path";
import { createPublicClient, formatEther, http, verifyMessage, type Address, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { executeX402AndAttestOnChain } from "../lib/agentSmartWallet";

const WALLET_FILE = path.join(process.cwd(), ".agent-wallet.json");
const chain = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org") });

export type Payment = {
  from: Address;
  to: Address;
  amount: string;
  asset: string;
  resource: string;
  nonce: string;
  txHash?: string;
};

function loadAccount() {
  const key =
    process.env.AGENT_PRIVATE_KEY ||
    process.env.WALLET_PRIVATE_KEY ||
    (fs.existsSync(WALLET_FILE) && JSON.parse(fs.readFileSync(WALLET_FILE, "utf8")).privateKey);
  return key ? privateKeyToAccount(key as Hex) : null;
}

function requireAccount() {
  let account = loadAccount();
  if (!account) {
    const privateKey = generatePrivateKey();
    try {
      fs.writeFileSync(WALLET_FILE, JSON.stringify({ privateKey }, null, 2));
    } catch {}
    account = privateKeyToAccount(privateKey);
  }
  return account;
}

export function createWallet() {
  if (loadAccount()) return getWalletAddress();
  const privateKey = generatePrivateKey();
  fs.writeFileSync(WALLET_FILE, JSON.stringify({ privateKey }, null, 2));
  return privateKeyToAccount(privateKey).address;
}

export function getWalletAddress() {
  return loadAccount()?.address ?? null;
}

export async function getWalletBalance() {
  const wei = await chain.getBalance({ address: requireAccount().address });
  return `${formatEther(wei)} ETH (Gas Sponsored via ERC-4337)`;
}

/**
 * Fetch a URL. If it asks for payment (402), sign the x402 payload AND submit
 * a real on-chain Base Sepolia transaction via the agent's ERC-4337 Smart Account!
 */
export async function payAndFetch(url: string) {
  const first = await fetch(url, { cache: "no-store" });
  if (first.status !== 402) return { data: await first.json() };

  const account = requireAccount();
  const { price, asset, payTo } = await first.json();

  // Execute real on-chain settlement on Base Sepolia via ERC-4337 Smart Account
  const onChainTx = await executeX402AndAttestOnChain({
    coinId: "usdc",
    priceUsd: Number(price || 0.01),
    sentiment: "X402_API_PAYMENT",
    resource: new URL(url).pathname,
    amount: `${price} ${asset}`,
  });

  const payment: Payment = {
    from: account.address,
    to: payTo,
    amount: price,
    asset,
    resource: new URL(url).pathname,
    nonce: crypto.randomUUID(),
    txHash: onChainTx.txHash,
  };
  const signature = await account.signMessage({ message: JSON.stringify(payment) });
  const header = Buffer.from(JSON.stringify({ payment, signature })).toString("base64");

  const paid = await fetch(url, { headers: { "X-PAYMENT": header }, cache: "no-store" });
  return {
    data: await paid.json(),
    payment: {
      status: paid.status,
      amount: `${price} ${asset}`,
      to: payTo,
      smartAccount: onChainTx.smartAccountAddress,
      txHash: onChainTx.txHash,
      explorerUrl: onChainTx.explorerUrl,
      signature: `${signature.slice(0, 18)}...`,
    },
  };
}

export async function verifyPayment(header: string | null) {
  if (!header) return null;
  try {
    const { payment, signature } = JSON.parse(Buffer.from(header, "base64").toString()) as {
      payment: Payment;
      signature: Hex;
    };
    const valid = await verifyMessage({
      address: payment.from,
      message: JSON.stringify(payment),
      signature,
    });
    return valid ? payment : null;
  } catch {
    return null;
  }
}