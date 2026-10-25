<div align="center">
  <img src="./public/risein-logo.svg" alt="CryptoOracle v3 Logo" width="120" />
  <h1>🔮 CryptoOracle v3 (Agentmaxxin Crypto Oracle — x402 + ERC-4337 Edition)</h1>
  <p><strong>Autonomous On-Chain Intelligence, DEX Liquidity, Pre-Trade Workflows & x402 Smart Account Payment Agent on Base Sepolia</strong></p>
</div>

---

## 📖 Project Description
**CryptoOracle v3** is an autonomous Web3 & DeFi intelligence agent built on **Base Sepolia** (`Chain ID: 84532`) that unifies real-time cryptocurrency telemetry, decentralized exchange (DEX) pool liquidity, smart contract security audits, DeFi protocol TVL, EVM gas metrics, and **verifiable on-chain `x402` micropayments** into deterministic workflows.

- **Week 1 (`v1.0`):** Established live cryptocurrency spot price discovery and basic tool-calling with Google Gemini.
- **Week 2 (`v2.0`):** Evolved into a multi-tool orchestration terminal with a custom Cyber-Oracle UI/UX, dynamic multi-model switching, and a 3-step Pre-Trade Readiness Pipeline across 5 Web3 APIs.
- **Week 3 (`v3.0` — Current):** Integrated the **x402 HTTP Payment Protocol (`v2`)** powered by **ERC-4337 Account Abstraction (Safe Smart Accounts + Pimlico Gasless Paymaster)** on Base Sepolia. The agent now owns a gas-sponsored Smart Account and autonomously negotiates `HTTP 402 Payment Required` challenges—executing real on-chain transactions on Base Sepolia and rendering verifiable BaseScan transaction receipts directly in the UI.

---

## 🎯 What Problem is Our AI Agent Solving?
1. **DeFi Workflow Fragmentation:** Traders manually jump between CoinGecko for prices, DexScreener for AMM pool depth, GoPlus for honeypot checks, DeFiLlama for protocol TVL, and block explorers for gas fees before executing a trade.
2. **Payment & Pop-Up Friction for Premium Institutional Data:** Traditional AI agents hit a paywall when requesting institutional whale orderbooks or smart-money flows. Requiring a human to sign up with a credit card or manually click MetaMask confirmation pop-ups for every API query breaks agent autonomy.

**CryptoOracle v3** solves both problems by chaining **12 modular tools** behind a single conversational terminal and equipping the agent with an **autonomous ERC-4337 Smart Wallet** that settles `x402` API payments on Base Sepolia with zero gas friction and zero browser pop-ups.

---

## 🛠️ Tech Stack (with Version Information)
- **Frontend Framework:** Next.js `v16.3.6` (App Router / Turbopack), React `v19.3.0`, React DOM `v19.3.0`
- **Language & Runtime:** TypeScript `v5.9.3`, Node.js `v20+`
- **Styling & Custom UI/UX:** Tailwind CSS `v4.3.3`, Shadcn UI `v4.21.0`, Base UI `v1.8.0`, Lucide React `v1.48.0`
- **AI SDK & Agent Runtime:** Google Gen AI SDK (`@google/genai` `v2.24.0`) with multi-step function calling & fail-safe autonomous fallback engine
- **Blockchain, Account Abstraction & x402 Settlement:**
  - `viem` `v2.57.11` (Base Sepolia RPC client, cryptographic signing, calldata encoding)
  - `permissionless` `v0.5.2` (Pimlico ERC-4337 Bundler & Verifying Paymaster client)
  - **Smart Account Standard:** Safe Smart Account `v1.4.1` on ERC-4337 `EntryPoint v0.7` (`0x0000000071727De22E5E9d8BAf0edAc6f37da032`)
  - **Payment Protocol:** `x402` HTTP Payment Protocol (`PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE` / `X-PAYMENT`, `PAYMENT-RESPONSE`)
  - **Network:** Base Sepolia Testnet (`Chain ID: 84532`, RPC: `https://sepolia.base.org`)
- **External Web3 Data APIs:** CoinGecko API `v3`, DexScreener API `v1`, GoPlus Security API `v1`, DeFiLlama API `v1`, Ethereum JSON-RPC `v2.0`
- **Deployment:** Vercel

---

## 🧰 List of All Tools Supported by the Agent (12 Active Modules)

### 💸 Week 3 Tools: `x402` Protocol & ERC-4337 Account Abstraction
1. **`unlock_x402_whale_intel`** *(Week 3 Core x402 Payment Tool)* – Requests institutional Whale Orderbook & Smart-Money Flows from `/api/x402-whale-intel`, intercepts the `HTTP 402 Payment Required` challenge, autonomously executes a gas-sponsored **ERC-4337 `UserOperation`** on Base Sepolia via `fetchWithX402AgentWallet` and `executeX402AndAttestOnChain`, retries with the cryptographic `PAYMENT-SIGNATURE` (`X-PAYMENT`) proof, and returns the unlocked whale metrics alongside the verifiable **BaseScan Transaction Hash & URL**.
2. **`get_erc4337_smart_wallet`** *(Week 3 Account Abstraction Telemetry)* – Initializes and queries the agent's counterfactual **ERC-4337 Safe Smart Account (`v1.4.1`)** address, underlying EOA signer address, Base Sepolia ETH balance, and Pimlico Paymaster sponsorship status.
3. **`get_weather`** *(Upgraded Week 3 On-Chain `x402` Tool)* – Uses the upgraded `payAndFetch` interceptor in `agent/wallet.ts` to both sign the `x402` payment payload (`0.01 USDC`) and submit a real on-chain Base Sepolia settlement transaction via the agent's ERC-4337 Smart Account.
4. **`get_my_wallet`** – Reads the agent's self-custodial Base Sepolia signer address, balance, and ERC-4337 sponsorship telemetry.

### ⚡ Week 1 & Week 2 Tools: Multi-Oracle DeFi Telemetry
5. **`run_pre_trade_oracle_workflow`** *(Week 2 Core 3-Step Pipeline)* – Autonomously chains CoinGecko market metrics $\rightarrow$ DexScreener liquidity depth $\rightarrow$ Ethereum RPC gas oracle in parallel to compute a unified **Trade Execution Readiness Score (`0-100`)**.
6. **`get_token_metrics`** – Fetches live USD spot price, 24h percentage change, market cap, 24h volume, and All-Time High (ATH) via CoinGecko `v3`.
7. **`scan_dex_liquidity`** – Queries DexScreener for active AMM liquidity pools, Fully Diluted Valuation (FDV), chain ID, and 24h buy/sell pressure.
8. **`audit_token_security`** – Audits ERC-20 smart contracts on Ethereum (`chainId: 1`) and Base (`chainId: 8453`) via GoPlus Security API for honeypot traps, mintability, open-source verification, and buy/sell tax anomalies.
9. **`get_defi_protocol_tvl`** – Queries DeFiLlama for real-time Total Value Locked (TVL) and multi-chain asset breakdown across DeFi protocols (e.g., Aave, Uniswap, Lido).
10. **`get_evm_gas_oracle`** – Queries live Ethereum JSON-RPC nodes to compute Standard, Fast, and Instant gas tiers in Gwei with congestion recommendations.
11. **`get_crypto_price`** – Lightweight spot price lookup in USD for rapid token checks.
12. **`roll_dice`** – Deterministic utility tool for randomized numeric generation.

---

## 🧠 Supported AI Models (Multi-Model Switching Enabled)
CryptoOracle v3 features a live **Model Switcher** in the top telemetry bar alongside an automatic multi-model failover queue:
- **Google Gemini 3.0 Flash:** `gemini-3.0-flash` (`v3.0` — Primary High-Speed Tool Calling)
- **Google Gemini Flash Latest:** `gemini-flash-latest` (Auto-alias)
- **Google Gemini 3.0 Pro:** `gemini-3.0-pro` (`v3.0` — Complex Multi-Step Reasoning)
- **Google Gemini 2.0 Flash:** `gemini-2.0-flash` (`v2.0` — Fallback Engine)

---

## ✨ Key Features (Including Week 3 `x402` Implementation)
- **End-to-End Autonomous `x402` Payment Flow on Base Sepolia:**
  1. **Resource Request:** The user prompts the agent to unlock paid institutional whale intelligence (`unlock_x402_whale_intel`).
  2. **`402` Challenge:** `/api/x402-whale-intel` responds with `HTTP 402 Payment Required` and a Base64-encoded `PAYMENT-REQUIRED` header specifying the Base Sepolia network (`Chain ID: 84532`), scheme (`exact-evm-erc4337`), and recipient treasury address.
  3. **On-Chain ERC-4337 Settlement:** The agent's **Safe Smart Account (`0x1bE64e70446C9194Aca7Fb37eee98fb0E6BB49f3`)** bundles, signs, and submits a gas-sponsored `UserOperation` on Base Sepolia via Pimlico's Bundler & Verifying Paymaster, anchoring the `x402` payment attestation on-chain.
  4. **Cryptographic Retry:** The agent retries the request with the `PAYMENT-SIGNATURE` (`X-PAYMENT`) header containing the Base Sepolia `txHash` and Smart Account payer address.
  5. **On-Chain RPC Verification:** The server verifies the transaction receipt directly on Base Sepolia RPC (`waitForTransactionReceipt`), returns `HTTP 200 OK` with a `PAYMENT-RESPONSE` header, and unlocks the whale orderbook metrics.
- **In-UI Transaction Verification & BaseScan Integration:** Every completed `x402` payment renders a dedicated **x402 On-Chain Settlement Confirmed** banner in the chat UI displaying the Smart Account address, the Transaction Hash, the 5-step protocol trace, and a one-click **"Verify on BaseScan ↗"** button.
- **3-Step Autonomous Pre-Trade Workflow:** Simultaneously verifies market momentum, DEX pool depth, and network gas fees before issuing a `STRONG_EXECUTE` or `PROCEED_WITH_SLIPPAGE_GUARD` verdict.
- **Fail-Safe Oracle Execution Engine:** Deterministic tool fallback ensures uninterrupted on-chain `x402` settlement and telemetry even during LLM provider rate-limit spikes.

---

## 🎥 Demo Video & Weekly Progression Links
- **Live Deployed Application:** [https://agentmaxxin-crypto-oracle.vercel.app](https://agentmaxxin-crypto-oracle.vercel.app)
- **Sample Verified On-Chain `x402` Transaction (Base Sepolia):** [https://sepolia.basescan.org/tx/0x07f01ccfe14890fa15c029bb2a5f011653aa85c131d8de28ba06f1c04](https://sepolia.basescan.org/tx/0x07f01ccfe14890fa15c029bb2a5f011653aa85c131d8de28ba06f1c04)

Week 1 (cryptooracle.v1): [Insert-Your-Week-1-Demo-Video-Link]

Week 2 (cryptooracle.v2): [Insert-Your-Week-2-Demo-Video-Link]

Week 3 (cryptooracle.v3): [Insert-Your-Week-3-Demo-Video-Link]

---

## 🚀 Future Scope (Post-Program Roadmap)
- **ERC-7715 Session Keys & Scoped Spend Permissions:** Allow users to grant fine-grained daily USDC spending limits to the agent's ERC-4337 Smart Account for recurring institutional data subscriptions.
- **Cross-Chain `x402` Facilitator Routing (EIP-3009):** Expand payment settlement to support gasless Circle USDC `TransferWithAuthorization` signatures across Base Mainnet, Arbitrum, and Optimism.
- **Zero-Knowledge (zkTLS) Oracle Attestations:** Pair on-chain `x402` receipts with cryptographic zkTLS proofs verifying the authenticity of off-chain institutional orderbook feeds.
- **Intent-Based Automated Swap Execution:** Route high-conviction whale accumulation signals directly into Uniswap v4 hooks on Base for autonomous trade execution.

---

## ⚙️ Local Setup & Configuration

1. **Clone the repository and install dependencies:**
   ```bash
   git clone [https://github.com/NavnathSagar/agentmaxxin-crypto-oracle.git](https://github.com/NavnathSagar/agentmaxxin-crypto-oracle.git)
   cd agentmaxxin-crypto-oracle
   npm install