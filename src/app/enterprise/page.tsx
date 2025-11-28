// src/app/enterprise/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
  ENTERPRISE_ABI,
  ENTERPRISE_ADDRESS,
  ERC20_ABI,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  FaBriefcase,
  FaCheck,
  FaCircleExclamation,
  FaCoins,
  FaFileCsv,
  FaLandmark,
  FaMoneyBillTransfer,
  FaPlus,
  FaTrash,
  FaUserTie,
  FaVault,
} from "react-icons/fa6";
import { formatEther, isAddress, maxUint256, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  WagmiProvider,
} from "wagmi";

const queryClient = new QueryClient();

export default function EnterprisePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="flex flex-col min-h-screen bg-[#020202] text-white font-sans relative overflow-x-hidden">
          <Navbar />

          {/* --- BACKGROUND LUXURY GOLD --- */}
          <div className="fixed top-0 left-0 w-full h-[800px] bg-gradient-to-b from-yellow-900/20 via-amber-900/10 to-transparent pointer-events-none z-0" />
          <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-yellow-900/10 to-transparent pointer-events-none" />

          {/* PERBAIKAN: Hapus 'items-center' dan 'justify-center'. Biarkan full width. */}
          <div className="flex-grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
            <div className="w-full max-w-7xl">
              <HeaderSection />
              <EnterpriseManager />
            </div>
          </div>

          <div className="relative z-10 mt-auto border-t border-yellow-900/20 bg-[#020202]">
            <Footer />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function HeaderSection() {
  return (
    <div className="mb-10 text-center sm:text-left border-b border-yellow-500/20 pb-8 flex flex-col sm:flex-row justify-between items-end gap-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">
          <FaUserTie /> Corporate Suite
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
          Enterprise{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600">
            Treasury
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          High-yield asset management & automated payroll execution.
        </p>
      </div>

      <div className="hidden sm:flex gap-6">
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Security Level
          </p>
          <p className="text-yellow-500 font-bold flex items-center justify-end gap-2">
            <FaVault /> Institutional
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Protocol
          </p>
          <p className="text-white font-bold">Lisk Sepolia</p>
        </div>
      </div>
    </div>
  );
}

interface RowData {
  address: string;
  amount: string;
}

function EnterpriseManager() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: companyInfo, refetch: refetchCompany } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "companyPools",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const isRegistered = companyInfo;

  if (!mounted)
    return (
      <div className="h-96 w-full flex items-center justify-center text-yellow-600 animate-pulse">
        Loading System...
      </div>
    );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border border-yellow-900/30 rounded-3xl bg-gradient-to-b from-yellow-900/10 to-black backdrop-blur-sm w-full max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 text-yellow-500 animate-pulse">
          <FaLandmark size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Authentication Required
        </h2>
        <p className="text-gray-400 mb-8 text-center px-4">
          Connect your corporate wallet to access the treasury.
        </p>
      </div>
    );
  }

  if (!isRegistered) {
    return <RegisterView onSuccess={refetchCompany} />;
  }

  return <EnterpriseDashboard />;
}

function RegisterView({ onSuccess }: { onSuccess: () => void }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) onSuccess();
  }, [isSuccess, onSuccess]);

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-black/60 border border-yellow-600/40 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-yellow-600 via-yellow-300 to-transparent"></div>

        <div className="w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-yellow-900/50 transform rotate-3 hover:rotate-0 transition-all duration-500">
          <FaBriefcase size={40} className="text-white drop-shadow-md" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Initialize Corporate Account
        </h2>
        <p className="text-gray-400 mb-10 leading-relaxed text-lg px-4">
          Your wallet address{" "}
          <span className="text-yellow-500 font-mono bg-yellow-900/20 px-2 py-0.5 rounded">
            0x...
          </span>{" "}
          is not registered in the Transcend Enterprise Protocol.
          <br />
          Registration grants access to <strong>
            yield-bearing pools
          </strong> and <strong>mass payroll</strong>.
        </p>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 justify-center text-left">
            <FaCircleExclamation size={24} />{" "}
            <span>{error.message.split("\n")[0]}</span>
          </div>
        )}

        <button
          onClick={() =>
            writeContract({
              address: ENTERPRISE_ADDRESS,
              abi: ENTERPRISE_ABI,
              functionName: "registerCompany",
            })
          }
          disabled={isPending || isConfirming}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg py-5 rounded-xl transition-all shadow-lg shadow-yellow-600/20 hover:shadow-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
          {isPending || isConfirming
            ? "Processing Registration..."
            : "Create Enterprise Account"}
        </button>
      </div>
    </div>
  );
}

function EnterpriseDashboard() {
  const { address } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const {
    writeContract: writeDeposit,
    isPending: isDepPending,
    data: depHash,
  } = useWriteContract();
  const { isLoading: isDepConfirming } = useWaitForTransactionReceipt({
    hash: depHash,
  });

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");
  const [rows, setRows] = useState<RowData[]>([{ address: "", amount: "" }]);
  const [csvPreview, setCsvPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    writeContract: writePayroll,
    isPending: isPayPending,
    data: payHash,
    error: payError,
  } = useWriteContract();
  const { isLoading: isPayConfirming, isSuccess: isPaySuccess } =
    useWaitForTransactionReceipt({ hash: payHash });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: USDT_ADDRESS,
    functionName: "allowance",
    args: address ? [address, ENTERPRISE_ADDRESS] : undefined,
  });
  const { data: yieldData, refetch: refetchYield } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "getYield",
    args: address ? [address, USDT_ADDRESS] : undefined,
  });

  const depositValueBigInt = depositAmount
    ? parseEther(depositAmount)
    : BigInt(0);
  const needsApproval =
    allowance !== undefined && allowance < depositValueBigInt;

  const handleApprove = () =>
    writeDeposit({
      address: USDT_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [ENTERPRISE_ADDRESS, maxUint256],
    });
  const handleDeposit = () => {
    if (depositAmount)
      writeDeposit({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "deposit",
        args: [USDT_ADDRESS, parseEther(depositAmount)],
      });
  };
  const handleExecutePayroll = () => {
    try {
      const recipients: `0x${string}`[] = [];
      const amounts: bigint[] = [];
      for (const row of rows) {
        if (
          !isAddress(row.address) ||
          !row.amount ||
          parseFloat(row.amount) <= 0
        ) {
          alert(`Invalid input`);
          return;
        }
        recipients.push(row.address as `0x${string}`);
        amounts.push(parseEther(row.amount));
      }
      writePayroll({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "executePayroll",
        args: [USDT_ADDRESS, recipients, amounts],
      });
    } catch (err) {
      console.error(err);
    }
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
      lines.forEach((l) => {
        const p = l.split(",").map((x) => x.trim());
        if (p.length >= 2 && isAddress(p[0]) && !isNaN(parseFloat(p[1])))
          newRows.push({ address: p[0], amount: p[1] });
      });
      if (newRows.length > 0) setRows(newRows);
    };
    reader.readAsText(file);
  };

  const addRow = () => setRows([...rows, { address: "", amount: "" }]);
  const removeRow = (i: number) => {
    const n = [...rows];
    n.splice(i, 1);
    setRows(n);
  };
  const handleInputChange = (i: number, f: "address" | "amount", v: string) => {
    const n = [...rows];
    n[i][f] = v;
    setRows(n);
  };
  const totalPayroll = rows.reduce(
    (acc, row) => acc + (parseFloat(row.amount) || 0),
    0
  );

  useEffect(() => {
    if (!isDepConfirming) {
      refetchAllowance();
      refetchYield();
    }
  }, [isDepConfirming]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* --- LEFT: GOLD VAULT (FUNDING) --- */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0A0A0A] border border-yellow-600/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-b from-yellow-400 to-yellow-700 rounded-lg flex items-center justify-center text-black shadow-lg">
                <FaLandmark />
              </span>
              Treasury
            </h3>
            <div className="bg-yellow-900/20 border border-yellow-700/30 px-3 py-1 rounded-full text-xs font-mono text-yellow-500">
              ASSET: USDT
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#1a1500] to-black border border-yellow-800/30 rounded-2xl p-6 mb-8 relative">
            <p className="text-xs text-yellow-600 font-bold tracking-[0.2em] uppercase mb-2">
              Accumulated Yield
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                +{yieldData ? formatEther(yieldData) : "0.00"}
              </span>
              <span className="text-sm text-yellow-700 font-bold">USDT</span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="relative group/input">
              <input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#050505] border border-yellow-900/40 rounded-xl px-5 py-5 text-white focus:border-yellow-500 outline-none text-xl font-mono transition-colors group-hover/input:border-yellow-700/60"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-yellow-600">
                DEPOSIT USDT
              </span>
            </div>

            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isDepPending || isDepConfirming}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(202,138,4,0.2)]"
              >
                {isDepPending ? "Approving Access..." : "1. Approve Contract"}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isDepPending || isDepConfirming || !depositAmount}
                className="w-full bg-gradient-to-r from-white to-gray-300 hover:from-white hover:to-white text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isDepPending || isDepConfirming
                  ? "Processing Deposit..."
                  : "2. Deposit to Pool"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT: EXECUTIVE LEDGER (PAYROLL) --- */}
      <div className="lg:col-span-8">
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 shadow-2xl h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Payroll Execution
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Batch process salary distribution using accumulated yield.
              </p>
            </div>

            <div className="flex bg-[#151515] p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setMode("MANUAL")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === "MANUAL"
                    ? "bg-yellow-600 text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setMode("CSV")}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === "CSV"
                    ? "bg-yellow-600 text-black shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                CSV Upload
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#050505] border border-white/5 rounded-2xl p-6 mb-6 overflow-hidden min-h-[300px]">
            {mode === "MANUAL" ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {rows.map((row, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-900/20 text-yellow-600 flex items-center justify-center font-mono text-xs border border-yellow-900/30">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="Recipient Wallet (0x...)"
                      value={row.address}
                      onChange={(e) =>
                        handleInputChange(index, "address", e.target.value)
                      }
                      className="flex-grow bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-40">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.amount}
                          onChange={(e) =>
                            handleInputChange(index, "amount", e.target.value)
                          }
                          className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none font-bold text-right"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                          $
                        </span>
                      </div>
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(index)}
                          className="w-12 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/20 rounded-xl flex items-center justify-center transition-colors"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addRow}
                  className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:text-yellow-500 hover:border-yellow-500/30 transition-all flex items-center justify-center gap-2 mt-4 text-sm font-medium"
                >
                  <FaPlus /> Add Recipient
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <FaFileCsv className="text-6xl text-yellow-800 mb-4" />
                <p className="text-gray-300 mb-6">
                  Upload your payroll CSV file for bulk processing.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                  Choose File
                </button>
                <textarea
                  readOnly
                  value={csvPreview}
                  className="mt-6 w-full h-32 bg-black border border-white/10 rounded-lg p-4 text-xs text-gray-500 font-mono"
                  placeholder="Preview..."
                />
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                  Total Allocation
                </p>
                <p className="text-3xl font-bold text-white">
                  {totalPayroll.toLocaleString()}{" "}
                  <span className="text-yellow-500 text-lg">USDT</span>
                </p>
              </div>
              {/* Visualizer Status */}
              <div className="hidden sm:block text-right">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                  Pool Status
                </p>
                <p
                  className={`font-bold flex items-center gap-2 justify-end ${
                    parseFloat(formatEther(yieldData || BigInt(0))) >=
                    totalPayroll
                      ? "text-green-500"
                      : "text-orange-500"
                  }`}
                >
                  {parseFloat(formatEther(yieldData || BigInt(0))) >=
                  totalPayroll ? (
                    <>
                      <FaCoins /> Covered by Yield
                    </>
                  ) : (
                    "Partially Principal"
                  )}
                </p>
              </div>
            </div>

            {isPaySuccess && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3">
                <FaCheck /> Transfer Successful
              </div>
            )}
            {payError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
                <FaCircleExclamation /> {payError.message.split("\n")[0]}
              </div>
            )}

            <button
              onClick={handleExecutePayroll}
              disabled={isPayPending || isPayConfirming || totalPayroll <= 0}
              className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 text-black font-extrabold text-lg py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.99]"
            >
              {isPayPending || isPayConfirming ? (
                "Processing Batch Transaction..."
              ) : (
                <span className="flex items-center justify-center gap-3">
                  EXECUTE PAYROLL <FaMoneyBillTransfer />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
