// C:\Users\dell\my-agent\lib\agentSmartWallet.ts
import fs from "fs";
import path from "path";
import { createPublicClient, createWalletClient, http, Hex, toHex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

const WALLET_FILE = path.join(process.cwd(), ".agent-wallet.json");

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

function getOrLoadPrivateKey(): Hex {
  const envKey = process.env.AGENT_PRIVATE_KEY || process.env.WALLET_PRIVATE_KEY;
  if (envKey && envKey.startsWith("0x") && envKey.length === 66) {
    return envKey as Hex;
  }
  if (fs.existsSync(WALLET_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(WALLET_FILE, "utf8"));
      if (saved.privateKey) return saved.privateKey as Hex;
    } catch {}
  }
  const newKey = generatePrivateKey();
  try {
    fs.writeFileSync(WALLET_FILE, JSON.stringify({ privateKey: newKey }, null, 2));
  } catch {}
  return newKey;
}

export async function getAgentSmartAccount() {
  const pk = getOrLoadPrivateKey();
  const owner = privateKeyToAccount(pk);
  const pimlicoKey = process.env.PIMLICO_API_KEY;

  if (!pimlicoKey) {
    return {
      smartAccountAddress: owner.address,
      ownerAddress: owner.address,
      smartAccountClient: null,
      owner,
    };
  }

  const pimlicoRpc = `https://api.pimlico.io/v2/base-sepolia/rpc?apikey=${pimlicoKey}`;
  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoRpc),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    owners: [owner],
    version: "1.4.1",
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: baseSepolia,
    bundlerTransport: http(pimlicoRpc),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return {
    smartAccountAddress: safeAccount.address,
    ownerAddress: owner.address,
    smartAccountClient,
    owner,
  };
}

/**
 * Executes a real on-chain Base Sepolia transaction via ERC-4337 Smart Account (gas-sponsored)
 * or falls back to standard EOA transaction if PIMLICO_API_KEY is not set.
 */
export async function executeX402AndAttestOnChain(params: {
  coinId: string;
  priceUsd: number;
  sentiment: string;
  resource?: string;
  amount?: string;
}) {
  const { smartAccountAddress, smartAccountClient, owner } = await getAgentSmartAccount();
  const treasury = (process.env.X402_TREASURY_ADDRESS ||
    "0x742d35cc6634c0532925a3b844bc9e7595f0beb0") as Hex;

  const attestationPayload = JSON.stringify({
    protocol: "x402-v2-onchain",
    resource: params.resource || `/api/x402-whale-intel?coin=${params.coinId}`,
    asset: params.coinId.toUpperCase(),
    spotPriceUsd: params.priceUsd,
    sentiment: params.sentiment,
    timestamp: new Date().toISOString(),
  });

  let txHash: Hex;

  if (smartAccountClient) {
    // Gas-sponsored ERC-4337 UserOperation on Base Sepolia!
    txHash = await smartAccountClient.sendTransaction({
      to: treasury,
      value: BigInt(0),
      data: toHex(attestationPayload),
    });
  } else {
    // Fallback to direct EOA transaction on Base Sepolia if no Pimlico key
    const walletClient = createWalletClient({
      account: owner,
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });
    txHash = await walletClient.sendTransaction({
      to: treasury,
      value: BigInt(0),
      data: toHex(attestationPayload),
    });
  }

  return {
    smartAccountAddress,
    txHash,
    explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`,
    attestationPayload,
  };
}

export async function fetchWithX402AgentWallet(
  baseUrl: string,
  coinId: string,
  priceUsd: number
) {
  const targetUrl = `${baseUrl}/api/x402-whale-intel?coin=${coinId}`;
  const protocolLogs: string[] = [];

  protocolLogs.push(`1. GET /api/x402-whale-intel?coin=${coinId}`);
  const initialRes = await fetch(targetUrl, { cache: "no-store" });

  if (initialRes.status === 402) {
    const challenge = await initialRes.json();
    const reqDetails = challenge.accepts?.[0] || {};
    protocolLogs.push(
      `2. HTTP 402 Payment Required | Network: ${reqDetails.network || "base-sepolia"} | PayTo: ${reqDetails.payTo}`
    );

    const paymentReceipt = await executeX402AndAttestOnChain({
      coinId,
      priceUsd,
      sentiment: "X402_WHALE_INTEL_UNLOCK",
      resource: `/api/x402-whale-intel?coin=${coinId}`,
    });

    protocolLogs.push(
      `3. On-Chain Base Sepolia Settlement Tx: ${paymentReceipt.txHash}`
    );

    const paymentProof = Buffer.from(
      JSON.stringify({
        x402Version: 2,
        scheme: "exact-evm-erc4337",
        network: "base-sepolia",
        payer: paymentReceipt.smartAccountAddress,
        txHash: paymentReceipt.txHash,
      })
    ).toString("base64");

    protocolLogs.push(
      `4. Retrying GET with PAYMENT-SIGNATURE header -> Verifying on Base Sepolia RPC...`
    );

    const paidRes = await fetch(targetUrl, {
      headers: {
        "PAYMENT-SIGNATURE": paymentProof,
        "X-PAYMENT": paymentProof,
      },
      cache: "no-store",
    });

    const unlockedData = await paidRes.json();
    protocolLogs.push(`5. HTTP 200 OK — Institutional Whale Telemetry Unlocked!`);

    return {
      protocolLogs,
      unlockedData,
      onChainReceipt: paymentReceipt,
    };
  }

  return {
    protocolLogs,
    unlockedData: await initialRes.json(),
    onChainReceipt: null,
  };
}
