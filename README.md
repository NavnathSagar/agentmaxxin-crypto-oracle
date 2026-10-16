<div align="center">
  <img src="./public/risein-logo.svg" alt="CryptoOracle v2 Logo" width="120" />
  <h1>🔮 CryptoOracle v2 (Agentmaxxin Crypto Oracle)</h1>
  <p><strong>Autonomous On-Chain Intelligence, DEX Liquidity & Pre-Trade Workflow Agent</strong></p>
</div>

---

## 📖 Project Description
**CryptoOracle v2** is an autonomous Web3 & DeFi intelligence agent built on Base Sepolia that unifies real-time cryptocurrency telemetry, decentralized exchange (DEX) pool liquidity, smart contract security audits, DeFi protocol TVL, EVM gas metrics, and x402 autonomous micropayments into deterministic workflows. In **Week 2 (v2.0)**, the project evolved from basic single-tool queries into a multi-tool orchestration terminal with a custom Cyber-Oracle UI/UX, dynamic model switching, and a 3-step Pre-Trade Readiness Pipeline.

---

## 🎯 What Problem is Our AI Agent Solving?
DeFi traders and Web3 users suffer from severe workflow fragmentation—manually jumping between CoinGecko for prices, DexScreener for AMM pool depth, GoPlus for honeypot checks, DeFiLlama for protocol TVL, and block explorers for gas fees before executing a single transaction. **CryptoOracle v2** eliminates this friction by chaining 10 modular tools and 5 live Web3 APIs behind a single conversational terminal that computes an actionable **Oracle Readiness Score (0–100)** in seconds.

---

## 🛠️ Tech Stack (with Version Information)
* **Frontend Framework:** Next.js `v15.2.0`, React `v19.0.0`
* **Language & Runtime:** TypeScript `v5.7.2`, Node.js `v20.18.0`
* **Styling & Custom UI/UX:** TailwindCSS `v4.0.0`, Shadcn UI, Lucide React `v0.475.0` (Custom Cyber-Oracle Obsidian & Neon Cyan Theme)
* **AI SDK & Agent Runtime:** Google Gen AI SDK (`@google/genai` `v0.1.1`) with multi-step function calling & autonomous fallback engine
* **Blockchain & Wallet Settlement:** Base Sepolia Testnet, x402 Payment Protocol (`payAndFetch`), Ethereum JSON-RPC `v2.0`
* **External Web3 Data APIs:** CoinGecko API `v3`, DexScreener API `v1`, GoPlus Security API `v1`, DeFiLlama API `v1`

---

## 🧰 List of All Tools Supported by the Agent (10 Active Modules)
1. **`run_pre_trade_oracle_workflow`** *(Week 2 Core Multi-Step Workflow)* – Autonomously chains CoinGecko market metrics $\rightarrow$ DexScreener liquidity depth $\rightarrow$ Ethereum RPC gas oracle in parallel to compute a unified **Trade Execution Readiness Score (`0-100`)**.
2. **`get_token_metrics`** – Fetches live USD spot price, 24h percentage change, market cap, 24h volume, and All-Time High (ATH) via CoinGecko `v3`.
3. **`scan_dex_liquidity`** – Queries DexScreener for active AMM liquidity pools, Fully Diluted Valuation (FDV), chain ID, and 24h buy/sell pressure.
4. **`audit_token_security`** – Audits ERC-20 smart contracts on Ethereum (`chainId: 1`) and Base (`chainId: 8453`) via GoPlus Security API for honeypot traps, mintability, open-source verification, and buy/sell tax anomalies.
5. **`get_defi_protocol_tvl`** – Queries DeFiLlama for real-time Total Value Locked (TVL) and multi-chain asset breakdown across DeFi protocols (e.g., Aave, Uniswap, Lido).
6. **`get_evm_gas_oracle`** – Queries live Ethereum JSON-RPC nodes to compute Standard, Fast, and Instant gas tiers in Gwei with congestion recommendations.
7. **`get_crypto_price`** – Lightweight spot price lookup in USD for rapid token checks.
8. **`get_my_wallet`** – Reads the agent's own self-custodial Base Sepolia wallet address and live testnet ETH balance.
9. **`get_weather`** – Paid API endpoint demonstrating autonomous **x402 micropayment signing** (`0.01 USDC`) via the agent's wallet.
10. **`roll_dice`** – Deterministic utility tool for randomized numeric generation.

---

## 🧠 Supported AI Models (Multi-Model Switching Enabled)
CryptoOracle v2 features a live **Model Switcher** in the top telemetry bar alongside an automatic multi-model failover queue:
* **Google Gemini 3.0 Flash:** `gemini-3.0-flash` (`v3.0` - Primary High-Speed Tool Calling)
* **Google Gemini Flash Latest:** `gemini-flash-latest` (Auto-alias)
* **Google Gemini 3.0 Pro:** `gemini-3.0-pro` (`v3.0` - Complex Reasoning)
* **Google Gemini 2.0 Flash:** `gemini-2.0-flash` (`v2.0` - Fallback Engine)

---

## ✨ Key Features
* **3-Step Autonomous Pre-Trade Workflow:** Simultaneously verifies market momentum, DEX pool depth, and network gas fees before issuing a `STRONG_EXECUTE` or `PROCEED_WITH_SLIPPAGE_GUARD` verdict.
* **Custom Cyber-Oracle Terminal UI:** Completely redesigned 2-column command center with live KPI badges, 1-click workflow preset cards, and collapsible JSON telemetry inspectors.
* **x402 Autonomous Wallet Integration:** Built-in Base Sepolia signer wallet capable of unlocking HTTP 402 payment-gated APIs automatically.
* **Fail-Safe Oracle Execution Engine:** Deterministic tool fallback ensures uninterrupted on-chain telemetry even during LLM provider rate-limit spikes.

---

## 🎥 Demo Video & Weekly Progression Links
* **Week 1 (cryptooracle.v1):** [Insert Your Week 1 Demo Video Link Here]
* **Week 2 (cryptooracle.v2):** [Insert Your Week 2 Demo Video Link Here]
* **Week 3 (cryptooracle.v3):** *Coming Soon*

---

## 🚀 Future Scope (Week 3 Roadmap)
* **x402 Premium Oracle Monetization:** Gate institutional whale-wallet tracking and MEV-resistant swap routing behind real-time x402 USDC micropayments on Base.
* **Zero-Knowledge (ZK) Oracle Proofs (zkTLS):** Integrate cryptographic attestations to verify that off-chain API responses from CoinGecko and GoPlus were not tampered with prior to execution.
* **Intent-Based On-Chain Swap Execution:** Connect the Oracle Readiness Score directly to a Base DEX router to autonomously execute token swaps when liquidity and gas conditions pass verification.

---

## 🌐 Social Media Links
* **Dedicated Product X (Twitter):** [https://x.com/YourProductHandle](https://x.com/YourProductHandle)
* **GitHub Repository:** [https://github.com/NavnathSagar/agentmaxxin-crypto-oracle](https://github.com/NavnathSagar/agentmaxxin-crypto-oracle)
# agentmaxxin

A minimal Next.js template for building AI agents that call tools and pay for services with their own crypto wallet. The agent is powered by Google Gemini.

The template is intentionally small. You will spend almost all of your time in a single file, `agent/tools.ts`, where each tool is a plain TypeScript function that the agent can decide to call.

## What You Get

1. A working agent loop that sends your message to Gemini, runs any tools Gemini asks for, and returns the final answer.
2. A tools file where you add, remove, or change the functions your agent can use.
3. An agent wallet that can sign payments, based on the x402 payment pattern.
4. A mock paid weather API that refuses requests until the agent pays for them.
5. A single page interface with guided setup, a one click wallet button, and a chat that shows every tool call and payment.

## Prerequisites

1. Node.js version 20 or newer. Check with `node -v`.
2. A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

## Getting Started

### Step 1. Create your project

Run the following command in your terminal. Replace `my-agent` with any folder name you like.

```bash
npx agentmaxxin my-agent
```

This copies the template into a new folder, creates a `.env` file for you, and installs all packages.

### Step 2. Move into the project folder

```bash
cd my-agent
```

### Step 3. Add your Gemini API key

Open the `.env` file in the project root and paste your key after the equals sign:

```bash
GEMINI_API_KEY=your_key_here
```

Save the file. The key stays on your machine and is never committed to git.

### Step 4. Start the app

```bash
npm run dev
```

### Step 5. Create the agent wallet

Open [http://localhost:3000](http://localhost:3000) in your browser. The Setup panel on the left walks you through everything.

Click **Create wallet**. The agent now has its own wallet, which it uses to sign payments for paid APIs. The wallet is saved in `.agent-wallet.json` in your project folder, so it stays the same after a restart.

### Step 6. Talk to your agent

Try one of these prompts:

1. `What's the weather in Mumbai?` The agent calls the paid weather API and pays for it with its wallet.
2. `What's in your wallet?` The agent reads its own wallet address and balance.
3. `Roll a 20 sided dice` The agent calls a simple tool with no wallet involved.

Click any tool entry above a reply to see exactly what the agent sent and received. The agent remembers the conversation, so you can ask follow up questions. Use **Clear** to start over.

### Step 7. Build your own tool

Open `agent/tools.ts` and add a new object to the `tools` list. For example:

```ts
{
  name: "get_joke",
  description: "Get a random joke.",
  parameters: { type: "object", properties: {} },
  run: async () => {
    const res = await fetch("https://official-joke-api.appspot.com/random_joke");
    return res.json();
  },
},
```

Save the file and refresh the page. Your new tool appears in the Tools panel. Now ask your agent to tell you a joke.

## Writing Good Tools

Every tool has four parts.

| Field | Purpose |
| :--- | :--- |
| `name` | A unique identifier in snake case, such as `get_weather`. |
| `description` | Plain English explaining what the tool does. Gemini reads this to decide when to use it, so be clear and specific. |
| `parameters` | A JSON Schema describing the inputs. Gemini fills in these values for you. |
| `run` | The function that does the work. Whatever it returns is sent back to Gemini. |

A few guidelines:

1. Return plain objects, for example `{ temperature: 28 }`, rather than strings or class instances.
2. Keep each tool focused on one job. Several small tools work better than one large tool.
3. If something can fail, let it throw. The agent loop catches the error and reports it back to Gemini, which can then explain the problem or try again.

## How It Works

### The agent loop

The loop lives in `agent/agent.ts`.

1. Your message and the list of tools are sent to Gemini.
2. If Gemini replies with a tool call, the matching `run` function is executed and its result is sent back to Gemini.
3. This repeats until Gemini replies with plain text, which becomes the final answer.
4. The loop stops after five rounds to prevent runaway tool calls.

### Paying for an API

The weather tool demonstrates the x402 pattern, where an agent pays for an API one request at a time.

1. The agent requests `/api/weather`.
2. The API responds with status `402 Payment Required` along with a price, an asset, and a recipient address.
3. The agent wallet signs a payment message for that amount.
4. The agent repeats the request with the signed payment in an `X-PAYMENT` header.
5. The API verifies the signature and responds with status `200 OK` and the weather data.

All of this is handled by the `payAndFetch` helper in `agent/wallet.ts`. Any tool that calls a paid API can use the same helper.

Payments in this template are cryptographically signed but are not submitted to a blockchain, so no real funds are ever moved.

## Project Structure

| Path | Description |
| :--- | :--- |
| `agent/tools.ts` | The tools your agent can use. This is the file you will edit most. |
| `agent/agent.ts` | The agent loop that communicates with Gemini. |
| `agent/wallet.ts` | The agent wallet, payment signing, and payment verification. |
| `app/page.tsx` | The page: setup steps, tools list, and chat. |
| `app/api/agent/route.ts` | The server endpoint that runs the agent. |
| `app/api/wallet/route.ts` | The server endpoint that creates and reads the agent wallet. |
| `app/api/weather/route.ts` | The mock paid weather API. |
| `components/ui/` | Interface components from [shadcn/ui](https://ui.shadcn.com). You do not need to edit these. |
| `.env` | Your API key and optional settings. |
| `.agent-wallet.json` | The agent wallet, created when you click Create wallet. Never share this file. |

## Configuration

All settings live in the `.env` file.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes | Your Gemini API key. |
| `GEMINI_MODEL` | No | The Gemini model to use. Defaults to `gemini-flash-latest`. |
| `WALLET_PRIVATE_KEY` | No | Use an existing wallet instead of the Create wallet button. A private key starting with `0x`. When set, it takes priority over `.agent-wallet.json`. |

Restart `npm run dev` after changing any value in `.env`.

## The Agent Wallet

Clicking **Create wallet** generates a new private key and saves it to `.agent-wallet.json`. The file is listed in `.gitignore`, so it is never committed.

Once the wallet exists, the Setup panel shows:

1. The wallet address, with a button to copy it.
2. The current ETH balance on Base Sepolia, with a refresh button.
3. A link to view the wallet on the Base Sepolia block explorer.
4. A link to faucets where you can request free test ETH.

To start again with a new wallet, stop the server, delete `.agent-wallet.json`, restart, and click **Create wallet** again.

To use a wallet you already have, set `WALLET_PRIVATE_KEY` in `.env` instead.

> **Security note:** Only ever use this wallet for testing. Never send real funds to it. Private keys in `.agent-wallet.json` and `.env` are stored as plain text.

## Troubleshooting

| Problem | Solution |
| :--- | :--- |
| The page says to add `GEMINI_API_KEY` | Add your key to `.env` and restart `npm run dev`. |
| The agent never uses my new tool | Make the `description` more specific about when the tool should be used, then restart the server. |
| The weather tool fails with "no wallet yet" | Click **Create wallet** in the Setup panel, then ask again. |
| Port 3000 is already in use | Run `npm run dev -- -p 3001` and open that port instead. |
| A model error appears in the chat | Check that your API key is valid, or set a different model in `GEMINI_MODEL`. |

## Tech Stack

1. [Next.js](https://nextjs.org) for the app and API routes.
2. [shadcn/ui](https://ui.shadcn.com) and [Tailwind CSS](https://tailwindcss.com) for the interface.
3. [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) for Gemini function calling.
4. [viem](https://viem.sh) for wallet creation, message signing, and reading Base Sepolia.

## License

MIT
