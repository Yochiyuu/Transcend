// src/app/dashboard/history/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import { CONTRACT_ADDRESS } from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowUpRightFromSquare,
  FaClockRotateLeft,
  FaSpinner,
} from "react-icons/fa6";
import { formatEther, parseAbiItem } from "viem";
import { useAccount, usePublicClient, WagmiProvider } from "wagmi";

const queryClient = new QueryClient();
const BLOCK_CHUNK_SIZE = 40000n;
const MAX_HISTORY_BLOCKS = 500000n;

export default function HistoryPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Layout Utama: flex-col & min-h-screen */}
        <main className="flex flex-col min-h-screen bg-[#080808] text-white font-sans relative overflow-x-hidden">
          <Navbar />

          {/* Konten Utama: flex-grow mengisi ruang kosong */}
          <div className="flex-grow flex flex-col px-6 sm:px-12 pt-36 pb-20 relative z-10 w-full max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <FaClockRotateLeft className="text-red-500" /> Transaction History
            </h1>
            <HistoryList />
          </div>

          {/* Footer: mt-auto */}
          <div className="relative z-10 mt-auto border-t border-white/5 bg-[#050505]">
            <Footer />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// ... (Kode HistoryList dan Interface HistoryItem biarkan SAMA PERSIS seperti sebelumnya) ...
// Saya tulis ulang singkat untuk kelengkapan

interface HistoryItem {
  hash: string;
  blockNumber: bigint;
  totalRecipients: string;
  totalNativeSent: string;
  totalERC20Sent: string;
  timestamp: string;
}

function HistoryList() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isMounted || !address || !publicClient) return;
      setLoading(true);
      setHistory([]);
      try {
        const eventSignature = parseAbiItem(
          "event MultiPaymentExecuted(address indexed sender, uint256 totalRecipients, uint256 totalNativeSent, uint256 totalERC20Sent)"
        );
        const currentBlock = await publicClient.getBlockNumber();
        const startBlockLimit =
          currentBlock - MAX_HISTORY_BLOCKS > 0n
            ? currentBlock - MAX_HISTORY_BLOCKS
            : 0n;
        let fromBlock = currentBlock - BLOCK_CHUNK_SIZE;
        let toBlock = currentBlock;
        let allLogs: any[] = [];
        while (toBlock > startBlockLimit) {
          if (fromBlock < startBlockLimit) fromBlock = startBlockLimit;
          setProgress(`Scanning blocks ${fromBlock} to ${toBlock}...`);
          try {
            const logs = await publicClient.getLogs({
              address: CONTRACT_ADDRESS,
              event: eventSignature,
              args: { sender: address },
              fromBlock,
              toBlock,
            });
            allLogs = [...allLogs, ...logs];
          } catch (err) {
            console.warn(`Failed logs ${fromBlock}-${toBlock}`, err);
          }
          toBlock = fromBlock - 1n;
          fromBlock = toBlock - BLOCK_CHUNK_SIZE;
        }
        allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
        const formattedHistory = await Promise.all(
          allLogs.map(async (log) => {
            const block = await publicClient.getBlock({
              blockNumber: log.blockNumber,
            });
            const date = new Date(Number(block.timestamp) * 1000);
            return {
              hash: log.transactionHash,
              blockNumber: log.blockNumber,
              totalRecipients: log.args.totalRecipients?.toString() || "0",
              totalNativeSent: formatEther(
                log.args.totalNativeSent || BigInt(0)
              ),
              totalERC20Sent: log.args.totalERC20Sent?.toString() || "0",
              timestamp: date.toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            };
          })
        );
        setHistory(formattedHistory);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
        setProgress("");
      }
    };
    if (isConnected && isMounted) {
      fetchHistory();
    }
  }, [address, isConnected, publicClient, isMounted]);

  if (!isMounted) return null;
  if (!isConnected)
    return (
      <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/5">
        <p className="text-gray-400">
          Please connect your wallet to view history.
        </p>
      </div>
    );
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-20 space-y-4">
        <FaSpinner className="animate-spin text-4xl text-red-500" />
        <p className="text-gray-400 text-sm animate-pulse">
          {progress || "Loading transaction history..."}
        </p>
      </div>
    );
  if (history.length === 0)
    return (
      <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/5">
        <p className="text-gray-400 mb-4">
          No transactions found in the last 10 days.
        </p>
        <Link
          href="/dashboard"
          className="text-red-500 hover:text-red-400 font-bold underline"
        >
          Make your first transfer
        </Link>
      </div>
    );

  return (
    <div className="overflow-x-auto bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-xl">
      <table className="w-full text-left text-gray-300">
        <thead className="bg-white/5 text-gray-100 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4">Transaction Hash</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-center">Recipients</th>
            <th className="px-6 py-4 text-right">Native Sent</th>
            <th className="px-6 py-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {history.map((item, i) => (
            <tr key={i} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-mono text-sm text-red-400">
                {item.hash.substring(0, 6)}...
                {item.hash.substring(item.hash.length - 4)}
              </td>
              <td className="px-6 py-4 text-sm">{item.timestamp}</td>
              <td className="px-6 py-4 text-center font-bold text-white">
                {item.totalRecipients}
              </td>
              <td className="px-6 py-4 text-right font-medium text-white">
                {item.totalNativeSent} LSK
              </td>
              <td className="px-6 py-4 text-center">
                <a
                  href={`https://sepolia-blockscout.lisk.com/tx/${item.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FaArrowUpRightFromSquare size={10} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
