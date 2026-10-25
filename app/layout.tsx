import "./globals.css";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata = {
  title: "CryptoOracle v3 // Autonomous On-Chain Intelligence & DeFi Workflow Agent",
  description: "Multi-tool Web3 AI agent chaining CoinGecko, DexScreener, GoPlus Security, DeFiLlama, and EVM Gas Oracles.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark font-sans antialiased", spaceGrotesk.variable, jetBrainsMono.variable)}>
      <body>{children}</body>
    </html>
  );
}
