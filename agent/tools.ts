/**
 * YOUR AGENT'S TOOLS
 *
 * A tool is just a function the agent is allowed to call.
 * Gemini reads the `description` to decide WHEN to use it,
 * and `parameters` to know WHAT to pass in.
 */
import { getWalletAddress, getWalletBalance, payAndFetch } from "./wallet";
import {
  getAgentSmartAccount,
  fetchWithX402AgentWallet,
  publicClient,
} from "../lib/agentSmartWallet";
import { formatEther } from "viem";
export type Tool = {
  name: string;
  description: string;
  /** JSON Schema describing the inputs. */
  parameters: object;
  /** The code that runs when the agent calls this tool. */
  run: (args: any, ctx: { baseUrl: string }) => Promise<unknown>;
};

export const tools: Tool[] = [
  // ─── 1. A paid API: the agent's wallet signs a payment to unlock it ───
  {
    name: "get_weather",
    description: "Get the current weather for a city. Costs 0.01 USDC, paid automatically from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. Mumbai" },
      },
      required: ["city"],
    },
    run: async ({ city }, { baseUrl }) => {
      return payAndFetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
    },
  },

  // ─── 2. Wallet tool: read the agent's own wallet ───
  {
    name: "get_my_wallet",
    description: "Get the agent's own wallet address and its ETH balance on Base Sepolia (testnet).",
    parameters: { type: "object", properties: {} },
    run: async () => ({
      address: getWalletAddress(),
      balance: await getWalletBalance(),
      network: "Base Sepolia (testnet)",
    }),
  },

  // ─── 3. Plain dice tool ───
  {
    name: "roll_dice",
    description: "Roll a dice with the given number of sides.",
    parameters: {
      type: "object",
      properties: {
        sides: { type: "number", description: "How many sides the dice has. Default 6." },
      },
    },
    run: async ({ sides = 6 }) => ({ rolled: Math.floor(Math.random() * sides) + 1, sides }),
  },

  // ─── 4. Quick Crypto Price (Week 1 Tool) ───
  {
    name: "get_crypto_price",
    description: "Get the current price of a cryptocurrency in USD.",
    parameters: {
      type: "object",
      properties: {
        coin_id: {
          type: "string",
          description: "The CoinGecko ID of the coin (e.g., bitcoin, ethereum, solana)",
        },
      },
      required: ["coin_id"],
    },
    run: async ({ coin_id }: { coin_id: string }) => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin_id)}&vs_currencies=usd`
      );
      return res.json();
    },
  },

  // ─── 5. Live Token Market Metrics (CoinGecko API) ───
  {
    name: "get_token_metrics",
    description: "Fetches live USD price, 24h change, market cap, volume, and ATH for a cryptocurrency (e.g., ethereum, bitcoin, solana).",
    parameters: {
      type: "object",
      properties: {
        coinId: { type: "string", description: "CoinGecko coin ID in lowercase, e.g., 'ethereum', 'solana', 'pepe'" },
      },
      required: ["coinId"],
    },
    run: async ({ coinId }: { coinId: string }) => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId.toLowerCase())}`
      );
      const data = await res.json();
      if (!data || data.length === 0) return { error: `Token '${coinId}' not found.` };
      const token = data[0];
      return {
        name: token.name,
        symbol: token.symbol.toUpperCase(),
        price_usd: token.current_price,
        change_24h_percent: token.price_change_percentage_24h,
        market_cap_usd: token.market_cap,
        volume_24h_usd: token.total_volume,
        ath_usd: token.ath,
      };
    },
  },

  // ─── 6. DEX Liquidity & Pair Analytics (DexScreener API) ───
  {
    name: "scan_dex_liquidity",
    description: "Searches on-chain DEX liquidity pools, FDV, and 24h buy/sell pressure for any token symbol or contract address.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Token symbol or contract address (e.g., 'UNI', 'AAVE', 'PEPE')" },
      },
      required: ["query"],
    },
    run: async ({ query }: { query: string }) => {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const topPair = data.pairs?.[0];
      if (!topPair) return { error: "No active DEX liquidity pools found." };
      return {
        pair: `${topPair.baseToken.symbol}/${topPair.quoteToken.symbol}`,
        chain: topPair.chainId,
        dex: topPair.dexId,
        price_usd: topPair.priceUsd,
        liquidity_usd: topPair.liquidity?.usd || 0,
        fdv_usd: topPair.fdv || 0,
        txns_24h: topPair.txns?.h24 || {},
        pair_url: topPair.url,
      };
    },
  },

  // ─── 7. Smart Contract Security & Honeypot Audit (GoPlus Security API) ───
  {
    name: "audit_token_security",
    description: "Audits an ERC-20 token contract address on Ethereum (chainId 1) or Base (chainId 8453) for honeypot risk, mintability, and buy/sell taxes.",
    parameters: {
      type: "object",
      properties: {
        chainId: { type: "string", description: "Chain ID: '1' for Ethereum, '8453' for Base, '56' for BSC" },
        contractAddress: { type: "string", description: "0x contract address of the token" },
      },
      required: ["chainId", "contractAddress"],
    },
    run: async ({ chainId, contractAddress }: { chainId: string; contractAddress: string }) => {
      const addr = contractAddress.toLowerCase();
      const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${addr}`);
      const data = await res.json();
      const info = data.result?.[addr];
      if (!info) return { status: "Unverified or native asset", address: contractAddress };
      return {
        token_name: info.token_name,
        is_honeypot: info.is_honeypot === "1",
        is_mintable: info.is_mintable === "1",
        is_open_source: info.is_open_source === "1",
        buy_tax: info.buy_tax,
        sell_tax: info.sell_tax,
        risk_verdict: info.is_honeypot === "1" ? "CRITICAL_HIGH_RISK" : "SAFE_TO_INTERACT",
      };
    },
  },

  // ─── 8. DeFi Protocol TVL Oracle (DeFiLlama API) ───
  {
    name: "get_defi_protocol_tvl",
    description: "Fetches Total Value Locked (TVL) and chain breakdown for any DeFi protocol (e.g., 'aave', 'uniswap', 'lido').",
    parameters: {
      type: "object",
      properties: {
        protocolSlug: { type: "string", description: "DeFiLlama protocol slug, e.g., 'aave', 'lido', 'uniswap'" },
      },
      required: ["protocolSlug"],
    },
    run: async ({ protocolSlug }: { protocolSlug: string }) => {
      const res = await fetch(`https://api.llama.fi/protocol/${encodeURIComponent(protocolSlug.toLowerCase())}`);
      if (!res.ok) return { error: `Protocol '${protocolSlug}' not found on DeFiLlama.` };
      const data = await res.json();
      return {
        name: data.name,
        category: data.category,
        current_tvl_usd: data.currentChainTvls,
        symbol: data.symbol,
        url: data.url,
      };
    },
  },

  // ─── 9. Live EVM Gas & Network Congestion Oracle ───
  {
    name: "get_evm_gas_oracle",
    description: "Fetches live Ethereum mainnet gas price estimates and network fee tiers in Gwei.",
    parameters: { type: "object", properties: {} },
    run: async () => {
      const res = await fetch("https://ethereum-rpc.publicnode.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
      });
      const data = await res.json();
      const wei = parseInt(data.result, 16);
      const gwei = +(wei / 1e9).toFixed(2);
      return {
        network: "Ethereum Mainnet",
        standard_gwei: gwei,
        fast_gwei: +(gwei * 1.25).toFixed(2),
        instant_gwei: +(gwei * 1.5).toFixed(2),
        recommendation: gwei < 15 ? "OPTIMAL_LOW_GAS" : gwei < 35 ? "MODERATE_GAS" : "HIGH_CONGESTION_WAIT",
      };
    },
  },

  // ─── 10. Multi-Step Workflow: Pre-Trade Oracle Pipeline (Week 2 Core Feature) ───
  {
    name: "run_pre_trade_oracle_workflow",
    description: "Executes a 3-step autonomous workflow: 1) Fetches CoinGecko market metrics, 2) Scans DexScreener pool liquidity, 3) Checks live EVM gas fees, returning a unified Trade Execution Readiness Score.",
    parameters: {
      type: "object",
      properties: {
        coinId: { type: "string", description: "CoinGecko ID (e.g., 'ethereum', 'uniswap', 'pepe')" },
        symbol: { type: "string", description: "Token ticker symbol (e.g., 'ETH', 'UNI', 'PEPE')" },
      },
      required: ["coinId", "symbol"],
    },
    run: async ({ coinId, symbol }: { coinId: string; symbol: string }) => {
      const [cgRes, dexRes, gasRes] = await Promise.all([
        fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId.toLowerCase())}`
        )
          .then((r) => r.json())
          .catch(() => []),
        fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(symbol)}`)
          .then((r) => r.json())
          .catch(() => ({})),
        fetch("https://ethereum-rpc.publicnode.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
        })
          .then((r) => r.json())
          .catch(() => ({ result: "0x3b9aca00" })),
      ]);

      const token = cgRes?.[0] || {};
      const topPair = dexRes?.pairs?.[0] || {};
      const gwei = +(parseInt(gasRes.result || "0x3b9aca00", 16) / 1e9).toFixed(2);
      const liqUsd = topPair.liquidity?.usd || 0;

      let score = 50;
      if (liqUsd > 500000) score += 25;
      if (gwei < 20) score += 15;
      if ((token.price_change_percentage_24h || 0) > -10) score += 10;

      return {
        workflow_status: "COMPLETED_3_STEP_PIPELINE",
        step1_market_oracle: {
          price_usd: token.current_price ?? topPair.priceUsd,
          change_24h: token.price_change_percentage_24h,
          market_cap: token.market_cap,
        },
        step2_dex_liquidity: {
          top_pool: `${topPair.baseToken?.symbol || symbol}/${topPair.quoteToken?.symbol || "USDC"}`,
          dex: topPair.dexId || "Uniswap",
          pool_liquidity_usd: liqUsd,
        },
        step3_network_gas: {
          current_gwei: gwei,
          gas_status: gwei < 20 ? "LOW_FEE_WINDOW" : "ELEVATED_FEES",
        },
        oracle_readiness_score: `${score}/100`,
        execution_verdict:
          score >= 75 ? "STRONG_EXECUTE" : score >= 50 ? "PROCEED_WITH_SLIPPAGE_GUARD" : "HIGH_RISK_AVOID",
      };
    },
  },
  // ─── 11. Week 3 Core Feature: Autonomous x402 Paid Whale Intelligence & On-Chain Settlement ───
  {
    name: "unlock_x402_whale_intel",
    description:
      "Autonomously pays an HTTP 402 (x402 protocol) challenge using the agent's ERC-4337 Smart Wallet on Base Sepolia to unlock institutional Whale Orderbook & Smart-Money Flows, returning the live BaseScan transaction hash and explorer link.",
    parameters: {
      type: "object",
      properties: {
        coinId: {
          type: "string",
          description: "CoinGecko ID of the asset to unlock whale intelligence for (e.g., 'ethereum', 'bitcoin', 'solana')",
        },
      },
      required: ["coinId"],
    },
    run: async ({ coinId = "ethereum" }: { coinId: string }, { baseUrl }) => {
      // Fetch spot price first for the on-chain attestation payload
      let priceUsd = 2500;
      try {
        const cg = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId.toLowerCase())}&vs_currencies=usd`
        ).then((r) => r.json());
        priceUsd = cg?.[coinId.toLowerCase()]?.usd ?? 2500;
      } catch {}

      const x402Result = await fetchWithX402AgentWallet(
        baseUrl,
        coinId.toLowerCase(),
        priceUsd
      );

      return {
        protocol: "x402 v2 + ERC-4337 Account Abstraction",
        network: "Base Sepolia (Chain ID: 84532)",
        smart_account_payer: x402Result.onChainReceipt?.smartAccountAddress,
        tx_hash: x402Result.onChainReceipt?.txHash,
        basescan_url: x402Result.onChainReceipt?.explorerUrl,
        x402_protocol_trace: x402Result.protocolLogs,
        unlocked_whale_intel: x402Result.unlockedData?.whaleMetrics,
      };
    },
  },

  // ─── 12. Week 3 ERC-4337 Smart Account Telemetry ───
  {
    name: "get_erc4337_smart_wallet",
    description:
      "Gets the agent's ERC-4337 Safe Smart Account address, EOA signer address, and gas-sponsored status on Base Sepolia.",
    parameters: { type: "object", properties: {} },
    run: async () => {
      const { smartAccountAddress, ownerAddress } = await getAgentSmartAccount();
      const bal = await publicClient.getBalance({ address: smartAccountAddress });
      return {
        account_type: "ERC-4337 Safe Smart Account v1.4.1 (Pimlico Paymaster Sponsored)",
        smart_account_address: smartAccountAddress,
        eoa_signer_address: ownerAddress,
        balance_eth: `${formatEther(bal)} ETH`,
        network: "Base Sepolia (Chain ID: 84532)",
        explorer_url: `https://sepolia.basescan.org/address/${smartAccountAddress}`,
      };
    },
  },
];
