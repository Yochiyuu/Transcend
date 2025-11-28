// src/app/dashboard/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import {
  CONTRACT_ADDRESS,
  ERC20_ABI,
  MULTI_SENDER_ABI,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link"; // Wajib import Link
import { useEffect, useRef, useState } from "react";
import {
  FaArrowUpRightFromSquare,
  FaChevronDown,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaFileCsv, // Pakai FaCircleInfo
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { isAddress, maxUint256, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  WagmiProvider,
} from "wagmi";

const queryClient = new QueryClient();
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="min-h-screen text-white font-sans flex flex-col bg-[#080808]">
          <Navbar />
          <div className="fixed bottom-0 left-0 right-0 h-[40vh] bg-linear-to-t from-red-900/20 to-transparent pointer-events-none z-0" />
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 relative z-10">
            <DashboardForm />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

interface RowData {
  address: string;
  amount: string;
  tokenAddress: string;
  symbol: string;
}

function DashboardForm() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");
  const [manualTokenType, setManualTokenType] = useState<"NATIVE" | "USDT">("NATIVE");
  const [rows, setRows] = useState<RowData[]>([{ address: "", amount: "", tokenAddress: ZERO_ADDRESS, symbol: "LSK" }]);
  const [totalUsdtNeeded, setTotalUsdtNeeded] = useState<bigint>(BigInt(0));
  const [csvPreview, setCsvPreview] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: USDT_ADDRESS,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: totalUsdtNeeded > 0 },
  });

  useEffect(() => { if (isConfirmed) refetchAllowance(); }, [isConfirmed, refetchAllowance]);

  useEffect(() => {
    let usdtTotal = BigInt(0);
    rows.forEach((row) => {
      if (row.tokenAddress === USDT_ADDRESS && row.amount && parseFloat(row.amount) > 0) {
        try { usdtTotal += parseEther(row.amount); } catch {}
      }
    });
    setTotalUsdtNeeded(usdtTotal);
  }, [rows]);

  const addRow = () => {
    const isNative = manualTokenType === "NATIVE";
    setRows([...rows, { address: "", amount: "", tokenAddress: isNative ? ZERO_ADDRESS : USDT_ADDRESS, symbol: isNative ? "LSK" : "USDT" }]);
  };

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleInputChange = (index: number, field: "address" | "amount", value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleManualTypeChange = (type: "NATIVE" | "USDT") => {
    setManualTokenType(type);
    const newRows = rows.map(r => ({
      ...r,
      tokenAddress: type === "NATIVE" ? ZERO_ADDRESS : USDT_ADDRESS,
      symbol: type === "NATIVE" ? "LSK" : "USDT"
    }));
    setRows(newRows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      setCsvPreview(text);
      setMode("CSV");
      const lines = text.split(/\r?\n/);
      const newRows: RowData[] = [];
      lines.forEach((line) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const addr = parts[0];
          const amt = parts[1];
          const symRaw = parts[2]?.toUpperCase() || "LSK";
          let tAddr = ZERO_ADDRESS;
          let tSym = "LSK";
          if (symRaw === "USDT") { tAddr = USDT_ADDRESS; tSym = "USDT"; }
          if (isAddress(addr) && !isNaN(parseFloat(amt))) {
            newRows.push({ address: addr, amount: amt, tokenAddress: tAddr, symbol: tSym });
          }
        }
      });
      if (newRows.length > 0) setRows(newRows);
      else alert("Invalid CSV format.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleApprove = () => {
    writeContract({ address: USDT_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [CONTRACT_ADDRESS, maxUint256] });
  };

  const handleMultiPay = async () => {
    try {
      const recipients: `0x${string}`[] = [];
      const tokens: `0x${string}`[] = [];
      const amounts: bigint[] = [];
      let totalValueNative = BigInt(0);
      for (const row of rows) {
        if (!isAddress(row.address)) { alert(`Invalid address`); return; }
        if (!row.amount || parseFloat(row.amount) <= 0) { alert(`Invalid amount`); return; }
        recipients.push(row.address as `0x${string}`);
        tokens.push(row.tokenAddress as `0x${string}`);
        const amountWei = parseEther(row.amount);
        amounts.push(amountWei);
        if (row.tokenAddress === ZERO_ADDRESS) totalValueNative += amountWei;
      }
      writeContract({ address: CONTRACT_ADDRESS, abi: MULTI_SENDER_ABI, functionName: "multiPay", args: [recipients, tokens, amounts], value: totalValueNative });
    } catch (err) { console.error(err); }
  };

  const needsApproval = allowance !== undefined && allowance < totalUsdtNeeded;
  const canSubmit = !isPending && !isConfirming;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-[#0f0f0f] border border-red-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {mode === "MANUAL" && (
          <div className="mb-8">
            <label className="text-white font-semibold text-lg mb-2 block">Token Type (Manual Mode)</label>
            <div className="relative">
              <select value={manualTokenType} onChange={(e) => handleManualTypeChange(e.target.value as "NATIVE" | "USDT")} className="w-full appearance-none bg-black/40 border border-red-900/30 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-500 transition-colors cursor-pointer">
                <option value="NATIVE">Lisk (Native)</option>
                <option value="USDT">Mock USDT (ERC20)</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="mb-6">
          <div onClick={() => setMode("MANUAL")} className="flex items-center gap-3 cursor-pointer group mb-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mode === "MANUAL" ? "border-red-500" : "border-gray-600 group-hover:border-red-400"}`}>
              {mode === "MANUAL" && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
            </div>
            <span className={`text-lg font-medium ${mode === "MANUAL" ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}>Manual Input</span>
          </div>
          {mode === "MANUAL" && (
            <div className="space-y-3 pl-2 animate-fade-in">
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3">
                    <div className="grow-[2]">
                      <input type="text" placeholder="0x... Address" value={row.address} onChange={(e) => handleInputChange(index, "address", e.target.value)} className="w-full bg-black/40 border border-red-900/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors" />
                    </div>
                    <div className="flex-1 flex gap-2">
                      <div className="relative w-full">
                        <input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleInputChange(index, "amount", e.target.value)} className="w-full bg-black/40 border border-red-900/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors" />
                      </div>
                      <div className="bg-black/40 border border-red-900/30 rounded-lg px-3 py-3 flex items-center justify-center min-w-[60px] text-gray-400 text-sm font-bold">{row.symbol}</div>
                      {rows.length > 1 && <button onClick={() => removeRow(index)} className="text-gray-600 hover:text-red-500 px-1 transition-colors"><FaTrash /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-red-900/50 hover:border-red-500 rounded-lg text-white text-sm transition-all"><FaPlus className="text-red-500" /> Add Recipient</button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div onClick={() => setMode("CSV")} className="flex items-center gap-3 cursor-pointer group mb-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${mode === "CSV" ? "border-red-500" : "border-gray-600 group-hover:border-red-400"}`}>
              {mode === "CSV" && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
            </div>
            <span className={`text-lg font-medium ${mode === "CSV" ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}>Upload CSV</span>
          </div>

          {mode === "CSV" && (
            <div className="pl-2 animate-fade-in">
              <div className="relative">
                <textarea readOnly value={csvPreview} placeholder="0x71C..., 0.15, ETH&#10;0x32B..., 50, USDT" className="w-full h-32 bg-black/40 border border-red-900/30 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none font-mono leading-relaxed" />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#d1d1d1] hover:bg-white text-black font-bold py-2.5 px-6 rounded-lg transition-colors">
                  <FaFileCsv /> Upload CSV
                </button>

                {/* --- LINK PANDUAN --- */}
                <Link 
                  href="/dashboard/csv-guide" 
                  target="_blank" 
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors group"
                >
                  <FaCircleInfo className="text-red-500 group-hover:scale-110 transition-transform" /> 
                  <span>Format Guide</span>
                  <FaArrowUpRightFromSquare className="text-xs" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {(isConfirmed || writeError) && (
          <div className="mb-6">
            {isConfirmed && <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg flex items-center gap-2 text-sm"><FaCircleCheck /> Transfer Successful!</div>}
            {writeError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2 text-sm"><FaCircleExclamation /> {writeError.message.split("\n")[0]}</div>}
          </div>
        )}

        {!isConnected ? (
          <button className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)]">Connect Wallet</button>
        ) : needsApproval ? (
          <button onClick={handleApprove} disabled={!canSubmit} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending || isConfirming ? "Approving USDT..." : `Approve USDT (${rows.filter(r => r.symbol === "USDT").length} txs)`}
          </button>
        ) : (
          <button onClick={handleMultiPay} disabled={!canSubmit} className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending || isConfirming ? "Processing..." : `Transfer ${rows.length} Assets`}
          </button>
        )}
      </div>
    </div>
  );
}