// src/app/api/agent-wallet/route.ts
import { NextResponse } from "next/server";
import { getAgentSmartAccount, publicClient } from "@/lib/agentSmartWallet";
import { formatEther } from "viem";

export async function GET() {
  try {
    const { smartAccountAddress, ownerAddress } = await getAgentSmartAccount();
    const balanceWei = await publicClient.getBalance({ address: smartAccountAddress });

    return NextResponse.json({
      network: "Base Sepolia (Chain ID: 84532)",
      accountType: "ERC-4337 Safe Smart Account (Gas Sponsored)",
      smartAccountAddress,
      ownerAddress,
      balanceEth: formatEther(balanceWei),
      explorerUrl: `https://sepolia.basescan.org/address/${smartAccountAddress}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}