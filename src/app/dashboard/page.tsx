// src/app/page.tsx
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
import { useEffect, useState } from "react";
import { formatUnits, isAddress, maxUint256, parseEther } from "viem";
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
        <main className="min-h-screen bg-background bg-red-glow-bottom">
          <Navbar />
          <div className="container mx-auto mt-12 px-4 flex justify-center pb-20">
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
          alert(`Address salah di baris ke-${rows.indexOf(row) + 1}`);
          return;
        }
        if (!row.amount || parseFloat(row.amount) <= 0) {
          alert(`Amount invalid di baris ke-${rows.indexOf(row) + 1}`);
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
      alert("Terjadi kesalahan validasi.");
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
      {isConnected && contractOwner && !isOwner && (
        <div className="absolute -top-16 left-0 right-0 bg-red-900/50 border border-primary text-red-200 p-3 rounded-lg text-center text-sm">
          ⚠️ Peringatan: Wallet Anda bukan Owner contract ini.
        </div>
      )}

      <div className="bg-card border border-border rounded-[20px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 border-2 border-primary/20 rounded-[20px] pointer-events-none"></div>

        <h2 className="text-xl font-bold mb-6">Transfer</h2>

        <div className="mb-8">
          <label className="block text-sm font-bold mb-3">Token Type</label>
          <select
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value as "NATIVE" | "USDT")}
            className="w-full bg-input border border-border rounded-lg px-4 py-3 appearance-none focus:border-primary outline-none transition cursor-pointer font-medium"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: `right 1rem center`,
              backgroundRepeat: `no-repeat`,
              backgroundSize: `1.5em 1.5em`,
            }}
            disabled={!isConnected}
          >
            <option value="NATIVE">Lisk (Native)</option>
            <option value="USDT">
              {tokenSymbol?.toString() || "USDT"} (ERC20)
            </option>
          </select>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
            <label className="font-bold">Manual Input</label>
          </div>

          <label className="block text-sm font-bold mb-3">To</label>
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-3 relative"
              >
                <input
                  type="text"
                  placeholder="0x... (Recipient Address)"
                  value={row.address}
                  onChange={(e) =>
                    handleInputChange(index, "address", e.target.value)
                  }
                  className="flex-[2] bg-input border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition font-mono text-sm"
                  disabled={!isConnected}
                />
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="ex: 0.15"
                    value={row.amount}
                    onChange={(e) =>
                      handleInputChange(index, "amount", e.target.value)
                    }
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:border-primary outline-none transition font-mono text-sm pr-16"
                    disabled={!isConnected}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                    {tokenType === "NATIVE" ? "LSK" : tokenSymbol?.toString()}
                  </span>
                </div>

                {rows.length > 1 && (
                  <button
                    onClick={() => removeRow(index)}
                    className="absolute -right-8 top-3 text-gray-500 hover:text-primary md:static md:bg-input md:border md:border-border md:hover:border-primary md:px-3 md:rounded-lg transition"
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
              className="w-10 h-10 bg-input border border-border rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition text-xl font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-8 opacity-50 pointer-events-none">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
            <label className="font-bold text-gray-400">
              Upload CSV (Coming Soon)
            </label>
          </div>
          <div className="bg-input border border-border rounded-lg h-32 p-4 text-gray-500 text-sm font-mono">
            0x.... , 0.15 , ETH
          </div>
          <button className="mt-4 bg-input border border-border text-gray-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            📄 Upload CSV
          </button>
        </div>

        {isConnected && totalAmountState > 0 && (
          <div className="flex justify-between items-center mb-6 py-4 border-t border-border">
            <span className="font-bold">Total Estimasi:</span>
            <span className="text-xl font-bold text-primary">
              {formatUnits(totalAmountState, 18)}{" "}
              {tokenType === "NATIVE" ? "LSK" : tokenSymbol?.toString()}
            </span>
          </div>
        )}

        <div className="mt-2">
          {!isConnected ? (
            <button className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-lg transition text-lg shadow-lg shadow-primary/20">
              Please Connect Wallet in Navbar
            </button>
          ) : needsApproval ? (
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-lg transition text-lg"
            >
              {isPending
                ? "Processing..."
                : isConfirming
                ? "Approving..."
                : `Approve ${tokenSymbol?.toString()}`}
            </button>
          ) : (
            <button
              onClick={handleMultiPay}
              disabled={isPending || isConfirming || !isOwner}
              className={`w-full font-bold py-4 rounded-lg transition text-lg shadow-lg ${
                !isOwner
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover shadow-primary/20"
              } text-white`}
            >
              {isPending
                ? "Processing..."
                : isConfirming
                ? "Sending..."
                : "Continue"}
            </button>
          )}
        </div>

        {isConfirmed && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500 text-green-400 rounded text-center text-sm">
            ✅ Transaction Successful!
            {tokenType === "USDT" &&
              (() => {
                refetchAllowance();
                return null;
              })()}
          </div>
        )}
        {writeError && (
          <div className="mt-4 p-3 bg-red-900/20 border border-primary text-red-400 rounded text-center text-sm break-words">
            ❌ Error: {writeError.message.split("\n")[0]}
          </div>
        )}
      </div>
    </div>
  );
}
