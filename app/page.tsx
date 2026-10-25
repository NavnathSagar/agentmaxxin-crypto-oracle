"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  Cpu,
  ExternalLink,
  Layers,
  RefreshCw,
  RotateCcw,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Step = { tool: string; args: unknown; result: any; error?: boolean };
type Message = { role: "user" | "agent"; text: string; steps?: Step[]; error?: boolean };
type Status = { hasApiKey: boolean; model: string; tools: { name: string; description: string }[] };
type WalletInfo = { address: string | null; balance?: string };

const SUPPORTED_MODELS = [
  { id: "gemini-3.0-flash", label: "Gemini 3.0 Flash (v3.0 - Latest)" },
  { id: "gemini-flash-latest", label: "Gemini Flash Latest (Auto)" },
  { id: "gemini-3.0-pro", label: "Gemini 3.0 Pro (v3.0)" },
];

const WORKFLOW_PRESETS = [
  {
    title: "💸 x402 Paid Whale Intelligence",
    badge: "x402 + ERC-4337",
    prompt: "Unlock institutional whale intelligence for Ethereum (coinId: ethereum) using x402 on-chain payment and show me the BaseScan transaction link.",
  },
  {
    title: "⚡ Pre-Trade Oracle Workflow",
    badge: "3-Step Pipeline",
    prompt: "Run the full pre-trade oracle workflow for Ethereum (coinId: ethereum, symbol: ETH) and explain the readiness score.",
  },
  {
    title: "💧 DEX Liquidity + TVL Scan",
    badge: "Multi-Tool",
    prompt: "Scan DEX liquidity for UNI and also fetch the DeFi protocol TVL for uniswap.",
  },
  {
    title: "🛡️ Token Security Audit",
    badge: "GoPlus API",
    prompt: "Audit token security on Ethereum (chainId 1) for PEPE contract 0x6982508145454Ce325dDbE47a25d4ec3d2311933.",
  },
];

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.0-flash");
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadWallet = () => fetch("/api/wallet").then((r) => r.json()).then(setWallet);

  useEffect(() => {
    fetch("/api/agent")
      .then((r) => r.json())
      .then((data: Status) => {
        setStatus(data);
        if (data?.model) setSelectedModel(data.model);
      });
    loadWallet();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function createWallet() {
    setCreating(true);
    await fetch("/api/wallet", { method: "POST" });
    await loadWallet();
    setCreating(false);
  }

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    const history: Message[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: history.filter((m) => !m.error).map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        data.error
          ? { role: "agent", text: data.error, error: true }
          : { role: "agent", text: data.answer, steps: data.steps },
      ]);
      if (data.steps?.some((s: Step) => s.result?.payment)) loadWallet();
    } catch {
      setMessages((m) => [
        ...m,
        { role: "agent", text: "Could not reach the server. Is `npm run dev` still running?", error: true },
      ]);
    }
    setThinking(false);
  }

  const ready = Boolean(status?.hasApiKey);
  const toolCount = status?.tools?.length || 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-6 md:px-10 md:py-8">
      {/* Top Custom Telemetry Navigation Bar */}
      <nav className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card/90 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-wider text-foreground uppercase">
                CryptoOracle
              </span>
              <Badge className="bg-primary font-mono text-[10px] text-primary-foreground uppercase">
                v3.0 x402 + ERC-4337
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Autonomous On-Chain Intelligence &amp; Pre-Trade Execution Agent
            </p>
          </div>
        </div>

        {/* Live Telemetry Badges & Model Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border bg-background/60 px-3 py-1.5 font-mono text-xs md:flex">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-muted-foreground">TOOLS:</span>
            <span className="font-bold text-primary">{toolCount} ACTIVE</span>
          </div>

          <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 font-mono text-xs">
            <Cpu className="size-3.5 text-primary" />
            <span className="text-muted-foreground">MODEL:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="cursor-pointer bg-transparent font-mono text-xs font-bold text-primary focus:outline-none"
            >
              {SUPPORTED_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="grid gap-4 rounded-lg border bg-gradient-to-r from-card via-card to-primary/5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary uppercase">
            <Sparkles className="size-3.5" /> Week 3 Build &amp; Ship // Autonomous x402 Payments
          </div>
          <h1 className="text-3xl font-bold tracking-tight uppercase md:text-5xl">
            On-Chain <span className="text-primary">Oracle &amp; Workflow</span> Terminal
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            Unifying CoinGecko market metrics, DexScreener pool liquidity, GoPlus contract security audits, DeFiLlama TVL, and Base Sepolia x402 wallet settlements into one autonomous agent.
          </p>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-md border bg-background/70 p-3">
            <p className="text-muted-foreground">ORACLES</p>
            <p className="mt-1 text-lg font-bold text-primary">5 APIs</p>
          </div>
          <div className="rounded-md border bg-background/70 p-3">
            <p className="text-muted-foreground">WORKFLOWS</p>
            <p className="mt-1 text-lg font-bold text-foreground">3-Step</p>
          </div>
          <div className="rounded-md border bg-background/70 p-3">
            <p className="text-muted-foreground">NETWORK</p>
            <p className="mt-1 text-lg font-bold text-primary">Base / EVM</p>
          </div>
        </div>
      </section>

      {/* Main Workspace: Left Chat & Workflows | Right Telemetry & Tool Registry */}
      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Autonomous Workflow Terminal */}
        <Card className="flex h-[calc(100vh-14rem)] min-h-[600px] flex-col border-primary/25">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              <SectionTitle num="01" title="Autonomous Workflow Terminal" />
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs uppercase"
                onClick={() => setMessages([])}
                disabled={messages.length === 0 || thinking}
              >
                <RotateCcw className="size-3.5" /> Reset Session
              </Button>
            </CardAction>
          </CardHeader>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-5 px-5 py-5">
              {messages.length === 0 && (
                <div className="flex flex-col gap-6 py-8">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex size-14 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                      <Bot className="size-7" />
                    </div>
                    <div>
                      <p className="text-xl font-bold tracking-tight uppercase">
                        Select an Autonomous Oracle Workflow
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Click a multi-step pipeline below or type any custom crypto query.
                      </p>
                    </div>
                  </div>

                  {/* 1-Click Workflow Cards */}
                  <div className="grid gap-3 md:grid-cols-2">
                    {WORKFLOW_PRESETS.map((w) => (
                      <button
                        key={w.title}
                        onClick={() => send(w.prompt)}
                        disabled={!ready}
                        className="group flex cursor-pointer flex-col justify-between gap-2 rounded-lg border bg-background/60 p-4 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary">
                            {w.title}
                          </span>
                          <Badge variant="outline" className="border-primary/40 font-mono text-[10px] text-primary">
                            {w.badge}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
                          &gt; {w.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="max-w-[85%] self-end rounded-lg bg-primary px-4 py-2.5 font-mono text-sm font-semibold text-primary-foreground"
                  >
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="flex max-w-[90%] gap-3 self-start">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      {m.steps?.map((s, j) => (
                        <ToolCall key={j} step={s} />
                      ))}
                      <div
                        className={cn(
                          "rounded-lg border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                          m.error
                            ? "flex gap-2 border-destructive/40 bg-destructive/10 text-destructive"
                            : "bg-muted/60"
                        )}
                      >
                        {m.error && <CircleAlert className="mt-0.5 size-4 shrink-0" />}
                        {m.text}
                      </div>
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <p className="flex items-center gap-2 font-mono text-xs text-primary">
                  <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
                  Executing oracle workflow via {selectedModel}...
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <CardFooter className="border-t bg-muted/20 pt-4">
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <div
                className={cn(
                  "flex flex-1 items-center rounded-md border border-input bg-background focus-within:border-primary",
                  !ready && "opacity-50"
                )}
              >
                <span className="pl-3 font-mono text-xs whitespace-nowrap text-primary">
                  oracle@v3:~$
                </span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    ready
                      ? "Run pre-trade workflow on ETH, scan DEX liquidity, audit token..."
                      : "Add your GEMINI_API_KEY in .env to start"
                  }
                  disabled={!ready}
                  className="h-11 border-0 bg-transparent font-mono text-sm focus-visible:ring-0"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-5 font-mono uppercase"
                disabled={!ready || thinking || !input.trim()}
              >
                <SendHorizontal className="size-4" /> Execute
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Right Column: Agent Wallet & Active Tool Registry */}
        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <SectionTitle num="02" title="Node & Wallet Telemetry" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col pt-4">
              <SetupStep number={1} title="LLM API Engine" done={ready}>
                {status && !ready ? (
                  <p className="text-xs text-muted-foreground">
                    Add <Code>GEMINI_API_KEY</Code> to <Code>.env</Code> and restart.
                  </p>
                ) : (
                  <p className="font-mono text-xs text-primary">
                    ONLINE // {selectedModel}
                  </p>
                )}
              </SetupStep>

              <SetupStep number={2} title="x402 Agent Signer Wallet" done={Boolean(wallet?.address)} last>
                {wallet && !wallet.address && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">
                      Signs autonomous x402 micropayments on Base Sepolia.
                    </p>
                    <Button
                      onClick={createWallet}
                      disabled={creating}
                      size="sm"
                      className="w-fit font-mono uppercase"
                    >
                      <Wallet className="size-3.5" /> {creating ? "Deploying..." : "Initialize Wallet"}
                    </Button>
                  </div>
                )}
                {wallet?.address && <WalletDetails wallet={wallet} onRefresh={loadWallet} />}
              </SetupStep>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="border-b">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" />
                  <SectionTitle num="03" title="Registered Oracle Tools" />
                </div>
                <Badge variant="outline" className="border-primary/40 font-mono text-xs text-primary">
                  {toolCount} Modules
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex max-h-[380px] flex-col gap-3 overflow-y-auto pt-4">
              {status?.tools.map((t) => (
                <div
                  key={t.name}
                  onClick={() => send(`Use the ${t.name} tool and show me how it works.`)}
                  className="cursor-pointer rounded-md border bg-background/50 p-3 transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs font-bold text-primary">
                      &gt; {t.name}()
                    </p>
                    {t.name.includes("workflow") && (
                      <Badge variant="outline" className="border-primary/40 font-mono text-[9px] text-primary">
                        PIPELINE
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <p className="font-mono text-xs font-bold tracking-[0.06em] uppercase">
      <span className="text-primary">{num}</span>
      <span className="ml-2 text-foreground">{title}</span>
    </p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">{children}</code>;
}

function SetupStep(props: { number: number; title: string; done: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px] font-bold",
            props.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary text-primary"
          )}
        >
          {props.done ? <Check className="size-3" strokeWidth={3} /> : props.number}
        </span>
        {!props.last && <span className={cn("w-0.5 flex-1", props.done ? "bg-primary" : "bg-border")} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", !props.last && "pb-5")}>
        <p className="font-mono text-xs font-bold tracking-tight uppercase">{props.title}</p>
        {props.children}
      </div>
    </div>
  );
}

function WalletDetails({ wallet, onRefresh }: { wallet: WalletInfo; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false);
  const address = wallet.address!;

  function copy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <code className="truncate font-mono text-xs text-primary">{address}</code>
        <Button variant="ghost" size="icon-xs" onClick={copy} aria-label="Copy address">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase">
        <span>
          BAL: <span className="font-bold text-foreground">{wallet.balance}</span>
        </span>
        <Button variant="ghost" size="icon-xs" onClick={onRefresh} aria-label="Refresh balance">
          <RefreshCw className="size-3.5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 font-mono text-[11px] uppercase">
        <a
          className="inline-flex items-center gap-1 text-primary hover:underline"
          href={`https://sepolia.basescan.org/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          BaseScan <ExternalLink className="size-3" />
        </a>
        <a
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
          href="https://docs.base.org/base-chain/tools/network-faucets"
          target="_blank"
          rel="noreferrer"
        >
          Faucet <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}

function ToolCall({ step }: { step: Step }) {
  const payment = step.result?.payment;
  const txHash = step.result?.tx_hash || payment?.txHash;
  const explorerUrl =
    step.result?.basescan_url ||
    payment?.explorerUrl ||
    (txHash ? `https://sepolia.basescan.org/tx/${txHash}` : null);
  const smartAccount = step.result?.smart_account_payer || payment?.smartAccount;

  return (
    <div className="flex flex-col gap-2">
      <Collapsible className="rounded-md border border-primary/30 bg-background/80 font-mono text-xs">
        <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/60">
          <ChevronRight className="size-3.5 text-primary transition-transform group-data-[panel-open]:rotate-90" />
          <Badge variant="outline" className="border-primary/40 font-mono text-[10px] text-primary uppercase">
            WORKFLOW STEP
          </Badge>
          <span className="font-bold text-foreground">{step.tool}()</span>
          {(payment || txHash) && (
            <Badge className="ml-auto bg-primary font-mono text-primary-foreground uppercase">
              {payment?.amount ? `x402 Paid ${payment.amount}` : "x402 Settled On-Chain"}
            </Badge>
          )}
          {step.error && (
            <Badge variant="destructive" className="ml-auto font-mono uppercase">
              Failed
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-2 border-t px-3 py-2">
          <Json label="Parameters" value={step.args} />
          <Json label="Oracle Telemetry Output" value={step.result} />
        </CollapsibleContent>
      </Collapsible>

      {/* Week 3 Requirement: Verifiable On-Chain x402 Transaction Banner */}
      {txHash && explorerUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/50 bg-primary/10 px-3.5 py-2.5 font-mono text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-primary uppercase">
              ✅ x402 On-Chain Settlement Confirmed (Base Sepolia)
            </span>
            {smartAccount && (
              <span className="text-[11px] text-muted-foreground">
                ERC-4337 Smart Account: {smartAccount.slice(0, 10)}...{smartAccount.slice(-8)}
              </span>
            )}
            <span className="text-[11px] text-foreground">
              Tx Hash: {txHash.slice(0, 14)}...{txHash.slice(-10)}
            </span>
          </div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-bold text-primary-foreground uppercase transition-opacity hover:opacity-90"
          >
            Verify on BaseScan <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-[10px] text-muted-foreground uppercase">{label}</p>
      <pre className="overflow-x-auto rounded bg-card p-2 text-[11px] text-primary">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
