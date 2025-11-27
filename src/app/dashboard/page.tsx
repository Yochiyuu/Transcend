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
import { FaFileCsv, FaPlus } from "react-icons/fa6";
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
        {/* Background hitam pekat agar merah menyala */}
        <main className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white font-sans bg-red-glow-bottom">
          <Navbar />

          <div className="container mx-auto mt-8 px-4 max-w-3xl">
            <h1 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">
              Transfer Manual
            </h1>
          </div>

          <div className="container mx-auto px-4 flex justify-center pb-20">
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

  const [tokenType, setTokenType] = useState<"NATIVE" | "USDT">("NATIVE");
  const [rows, setRows] = useState([{ address: "", amount: "" }]);
  const [mounted, setMounted] = useState(false);
  const [totalAmountState, setTotalAmountState] = useState<bigint>(BigInt(0));

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: contractOwner } = useReadContract({
    abi: MULTI_SENDER_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "owner",
  });
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
    try {
      let total = BigInt(0);
      rows.forEach((row) => {
        if (row.amount && parseFloat(row.amount) > 0)
          total += parseEther(row.amount);
      });
      setTotalAmountState(total);
    } catch (e) {}
  }, [rows]);

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

      if (newRows.length > 0) {
        setRows(newRows);
        alert(`Loaded ${newRows.length} rows from CSV.`);
      } else {
        alert("Invalid CSV format.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

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

  const isOwner = isConnected && contractOwner && address === contractOwner;

  if (!mounted) return null;

  return (
    <div className="w-full max-w-3xl relative">

      {/* --- CARD UTAMA --- */}
      {/* Border merah tipis di sekeliling card (border-primary/50) */}
      <div className="bg-[#0f0f0f] border border-primary/50 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(255,59,71,0.15)] relative overflow-hidden">
        {/* Efek Glow Merah Halus di Background Card */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

        {/* 1. SECTION: TOKEN TYPE */}
        <div className="mb-8 relative z-10">
          <label className="block text-white font-bold mb-3 text-lg">
            Token Type
          </label>
          <div className="relative">
            {/* Border Input Merah (border-primary/40) */}
            <select
              value={tokenType}
              onChange={(e) =>
                setTokenType(e.target.value as "NATIVE" | "USDT")
              }
              disabled={!isConnected}
              className="w-full bg-[#0a0a0a] border border-primary/40 hover:border-primary focus:border-primary text-gray-200 rounded-xl px-4 py-3 appearance-none outline-none transition cursor-pointer font-medium"
            >
              <option value="NATIVE">Lisk (Native Token)</option>
              <option value="USDT">
                {tokenSymbol?.toString() || "USDT"} (ERC20)
              </option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
              ▼
            </div>
          </div>
        </div>

        {/* 2. SECTION: MANUAL INPUT */}
        <div className="mb-8 relative z-10">
          {/* Indikator Option Merah */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              {/* Bisa diisi dot merah jika aktif */}
              <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
            </div>
            <span className="text-lg font-bold text-gray-300">Option</span>
          </div>

          <label className="block text-white font-bold mb-3 ml-1">To</label>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-3 items-center"
              >
                {/* Input Address dengan Border Merah Halus */}
                <div className="flex-[3] w-full">
                  <input
                    type="text"
                    placeholder="0x... (Address)"
                    value={row.address}
                    onChange={(e) =>
                      handleInputChange(index, "address", e.target.value)
                    }
                    className="w-full bg-[#0a0a0a] border border-primary/40 focus:border-primary rounded-xl px-4 py-3 text-white outline-none transition placeholder-gray-600 font-mono text-sm shadow-inner shadow-black/50"
                    disabled={!isConnected}
                  />
                </div>

                {/* Input Amount */}
                <div className="flex-[1.5] w-full relative">
                  <input
                    type="number"
                    placeholder="ex : 0.15"
                    value={row.amount}
                    onChange={(e) =>
                      handleInputChange(index, "amount", e.target.value)
                    }
                    className="w-full bg-[#0a0a0a] border border-primary/40 focus:border-primary rounded-xl px-4 py-3 text-white outline-none transition placeholder-gray-600 font-mono text-sm shadow-inner shadow-black/50"
                    disabled={!isConnected}
                  />
                </div>

                {/* Token Symbol Box */}
                <div className="flex-[1] w-full sm:w-auto">
                  <div className="w-full bg-[#0a0a0a] border border-primary/40 rounded-xl px-4 py-3 text-gray-300 text-center font-bold text-sm flex items-center justify-between">
                    {tokenType === "NATIVE"
                      ? "LSK"
                      : tokenSymbol?.toString() || "TOK"}
                    <span className="text-xs ml-2 text-primary">▼</span>
                  </div>
                </div>

                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="text-gray-500 hover:text-primary transition px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={addRow}
              disabled={!isConnected}
              className="w-10 h-10 bg-[#0a0a0a] border border-primary/40 hover:border-primary rounded-lg flex items-center justify-center text-primary hover:bg-primary hover:text-white transition"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* 3. SECTION: CSV UPLOAD */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"></div>
            <span className="text-lg font-bold text-gray-300">Option</span>
          </div>

          <label className="block text-white font-bold mb-3 ml-1">
            Upload CSV
          </label>

          {/* Area Textarea dengan Border Merah */}
          <div className="w-full h-32 bg-[#0a0a0a] border border-primary/40 rounded-xl p-4 text-sm font-mono text-gray-500 mb-4 overflow-y-auto shadow-inner shadow-black/50">
            {rows.length > 1 && rows[0].address !== "" ? (
              <div className="text-gray-300">
                {rows.slice(0, 3).map((r, i) => (
                  <div key={i}>
                    {r.address.slice(0, 10)}... , {r.amount}
                  </div>
                ))}
                {rows.length > 3 && (
                  <div>... ({rows.length - 3} more rows)</div>
                )}
              </div>
            ) : (
              <>
                0x742d35Cc6634C0532925a3b844Bc454e4438f44e , 0.15
                <br />
                0x812d35Cc6634C0532925a3b844Bc454e4438f123 , 1.2
                <br />
                <span className="opacity-40 text-xs italic mt-2 block text-primary/80">
                  (Upload .csv file with address,amount format)
                </span>
              </>
            )}
          </div>

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
            className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <FaFileCsv className="text-primary text-lg" />
            Upload CSV
          </button>
        </div>

        {/* 4. ACTION BUTTON (MERAH SOLID) */}
        <div className="mt-8 relative z-10">
          {!isConnected ? (
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition text-lg shadow-[0_0_30px_rgba(255,59,71,0.4)] border border-primary">
              Connect Wallet
            </button>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-xl transition text-lg shadow-[0_0_20px_rgba(202,138,4,0.4)]"
            >
              {isPending || isConfirming
                ? "Approving..."
                : `Approve ${tokenSymbol?.toString()}`}
            </button>
          ) : (
            <button
              onClick={handleMultiPay}
              disabled={isPending || isConfirming || !isOwner}
              className={`w-full font-bold py-4 rounded-xl transition text-lg shadow-[0_0_30px_rgba(255,59,71,0.4)] ${
                !isOwner
                  ? "bg-gray-700 cursor-not-allowed text-gray-400"
                  : "bg-primary hover:bg-primary-hover text-white border border-primary"
              }`}
            >
              {isPending || isConfirming ? "Processing..." : "Transfer Assets"}
            </button>
          )}
        </div>

        {/* Status Messages */}
        {isConfirmed && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500 text-green-400 rounded-xl text-center text-sm font-medium shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            ✅ Transaction Successful!
            {tokenType === "USDT" &&
              (() => {
                refetchAllowance();
                return null;
              })()}
          </div>
        )}
        {writeError && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-xl text-center text-sm break-words font-medium shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            ❌ Error: {writeError.message.split("\n")[0]}
          </div>
        )}
      </div>
    </div>
  );
}
