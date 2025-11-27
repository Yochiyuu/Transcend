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
import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaCircleCheck,
  FaCircleExclamation,
  FaFileCsv,
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

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Background Utama Gelap sesuai desain */}
        <main className="min-h-screen text-white font-sans flex flex-col bg-[#080808]">
          <Navbar />

          {/* Efek Glow Merah di bawah */}
          <div className="fixed bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none z-0" />

          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-28 relative z-10">
            <DashboardForm />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function DashboardForm() {
  const { address, isConnected } = useAccount();
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // STATE
  const [tokenType, setTokenType] = useState<"NATIVE" | "USDT">("NATIVE");
  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL"); // State untuk memilih mode input
  const [rows, setRows] = useState([{ address: "", amount: "" }]);
  const [mounted, setMounted] = useState(false);
  const [totalAmountState, setTotalAmountState] = useState<bigint>(BigInt(0));
  const [csvPreview, setCsvPreview] = useState(""); // Untuk menampilkan text di textarea CSV

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- READ CONTRACTS ---
  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    address: USDT_ADDRESS,
    functionName: "symbol",
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: USDT_ADDRESS,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: tokenType === "USDT" },
  });

  useEffect(() => {
    if (isConfirmed && tokenType === "USDT") refetchAllowance();
  }, [isConfirmed, tokenType, refetchAllowance]);

  // Hitung Total
  useEffect(() => {
    try {
      let total = BigInt(0);
      rows.forEach((row) => {
        if (row.amount && parseFloat(row.amount) > 0)
          total += parseEther(row.amount);
      });
      setTotalAmountState(total);
    } catch (e) {}
  }, [rows]);

  // --- ACTIONS ---
  const addRow = () => setRows([...rows, { address: "", amount: "" }]);

  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleInputChange = (
    index: number,
    field: "address" | "amount",
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      setCsvPreview(text); // Tampilkan text di textarea
      setMode("CSV"); // Otomatis pindah ke mode CSV

      const lines = text.split(/\r?\n/);
      const newRows: { address: string; amount: string }[] = [];

      lines.forEach((line) => {
        const parts = line.split(",");
        if (parts.length >= 2) {
          const addr = parts[0].trim();
          const amt = parts[1].trim();
          if (isAddress(addr) && !isNaN(parseFloat(amt))) {
            newRows.push({ address: addr, amount: amt });
          }
        }
      });

      if (newRows.length > 0) setRows(newRows);
      else alert("Invalid CSV format.");

      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  // Logic Approve & Pay sama seperti sebelumnya
  const handleApprove = () => {
    writeContract({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxUint256],
    });
  };

  const handleMultiPay = async () => {
    try {
      const recipients: `0x${string}`[] = [];
      const tokens: `0x${string}`[] = [];
      const amounts: bigint[] = [];
      let totalValueNative = BigInt(0);

      for (const row of rows) {
        if (!isAddress(row.address)) {
          alert(`Invalid address at row ${rows.indexOf(row) + 1}`);
          return;
        }
        if (!row.amount || parseFloat(row.amount) <= 0) {
          alert(`Invalid amount at row ${rows.indexOf(row) + 1}`);
          return;
        }
        recipients.push(row.address as `0x${string}`);
        const amountWei = parseEther(row.amount);
        amounts.push(amountWei);

        if (tokenType === "NATIVE") {
          tokens.push("0x0000000000000000000000000000000000000000");
          totalValueNative += amountWei;
        } else {
          tokens.push(USDT_ADDRESS);
        }
      }
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MULTI_SENDER_ABI,
        functionName: "multiPay",
        args: [recipients, tokens, amounts],
        value: tokenType === "NATIVE" ? totalValueNative : BigInt(0),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const needsApproval =
    tokenType === "USDT" &&
    allowance !== undefined &&
    allowance < totalAmountState;
  const canSubmit = !isPending && !isConfirming;
  const currentSymbol =
    tokenType === "NATIVE" ? "LSK" : tokenSymbol?.toString() || "USDT";

  if (!mounted) return null;

  return (
    <div className="w-full max-w-2xl">
      {/* Container Form Utama sesuai Gambar */}
      <div className="bg-[#0f0f0f] border border-red-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* --- FORM HEADER: TOKEN TYPE --- */}
        <div className="mb-8">
          <label className="text-white font-semibold text-lg mb-2 block">
            Token Type
          </label>
          <div className="relative">
            <select
              value={tokenType}
              onChange={(e) =>
                setTokenType(e.target.value as "NATIVE" | "USDT")
              }
              className="w-full appearance-none bg-black/40 border border-red-900/30 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
            >
              <option value="NATIVE">Lisk (Native)</option>
              <option value="USDT">Mock USDT (ERC20)</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* --- OPTION 1: MANUAL INPUT --- */}
        <div className="mb-6">
          <div
            onClick={() => setMode("MANUAL")}
            className="flex items-center gap-3 cursor-pointer group mb-4"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                mode === "MANUAL"
                  ? "border-red-500"
                  : "border-gray-600 group-hover:border-red-400"
              }`}
            >
              {mode === "MANUAL" && (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </div>
            <span
              className={`text-lg font-medium ${
                mode === "MANUAL"
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-300"
              }`}
            >
              Manual Input
            </span>
          </div>

          {mode === "MANUAL" && (
            <div className="space-y-3 pl-2 animate-fade-in">
              <label className="text-gray-400 text-sm mb-1 block">
                Recipients & Amounts
              </label>

              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {rows.map((row, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3">
                    {/* Address Input */}
                    <div className="flex-[2]">
                      <input
                        type="text"
                        placeholder="0x... Address"
                        value={row.address}
                        onChange={(e) =>
                          handleInputChange(index, "address", e.target.value)
                        }
                        className="w-full bg-black/40 border border-red-900/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Amount Input */}
                    <div className="flex-1 flex gap-2">
                      <div className="relative w-full">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.amount}
                          onChange={(e) =>
                            handleInputChange(index, "amount", e.target.value)
                          }
                          className="w-full bg-black/40 border border-red-900/30 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition-colors"
                        />
                      </div>

                      {/* Symbol Badge (Read-only box like image) */}
                      <div className="bg-black/40 border border-red-900/30 rounded-lg px-3 py-3 flex items-center justify-center min-w-[60px] text-gray-400 text-sm font-bold">
                        {currentSymbol}
                      </div>

                      {/* Delete Button */}
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(index)}
                          className="text-gray-600 hover:text-red-500 px-1 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-red-900/50 hover:border-red-500 rounded-lg text-white text-sm transition-all"
                >
                  <FaPlus className="text-red-500" /> Add Recipient
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- OPTION 2: CSV UPLOAD --- */}
        <div className="mb-8">
          <div
            onClick={() => setMode("CSV")}
            className="flex items-center gap-3 cursor-pointer group mb-4"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                mode === "CSV"
                  ? "border-red-500"
                  : "border-gray-600 group-hover:border-red-400"
              }`}
            >
              {mode === "CSV" && (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              )}
            </div>
            <span
              className={`text-lg font-medium ${
                mode === "CSV"
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-300"
              }`}
            >
              Upload CSV
            </span>
          </div>

          {mode === "CSV" && (
            <div className="pl-2 animate-fade-in">
              <div className="relative">
                <textarea
                  readOnly
                  value={csvPreview}
                  placeholder="0x71C... , 0.15, ETH"
                  className="w-full h-32 bg-black/40 border border-red-900/30 rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none font-mono"
                />
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-[#d1d1d1] hover:bg-white text-black font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  <FaFileCsv /> Upload CSV
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- STATUS MESSAGES --- */}
        {(isConfirmed || writeError) && (
          <div className="mb-6">
            {isConfirmed && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg flex items-center gap-2 text-sm">
                <FaCircleCheck /> Transfer Successful!
              </div>
            )}
            {writeError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-center gap-2 text-sm">
                <FaCircleExclamation /> {writeError.message.split("\n")[0]}
              </div>
            )}
          </div>
        )}

        {/* --- MAIN ACTION BUTTON --- */}
        {!isConnected ? (
          <button className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)]">
            Connect Wallet
          </button>
        ) : needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={!canSubmit}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming
              ? "Approving..."
              : `Approve ${currentSymbol}`}
          </button>
        ) : (
          <button
            onClick={handleMultiPay}
            disabled={!canSubmit}
            className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,59,48,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming ? "Processing..." : "Transfer Assets"}
          </button>
        )}
      </div>
    </div>
  );
}
