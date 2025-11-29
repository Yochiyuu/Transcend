// src/app/dashboard/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
  CONTRACT_ADDRESS,
  DAI_ADDRESS,
  ERC20_ABI,
  MULTI_SENDER_ABI,
  USDT_ADDRESS,
} from "@/utils/abi";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FaArrowUpRightFromSquare,
  FaCaretDown,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaFileCsv,
  FaPlus,
  FaRocket,
  FaTrash,
  FaUsers,
  FaWallet, // Import icon wallet
} from "react-icons/fa6";
import { isAddress, maxUint256, parseEther } from "viem";
import {
  useAccount,
  useConnect,
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
        <main className="flex flex-col min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
          <Navbar />

          <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
          {/* Fixed: bg-gradient-to-t -> bg-linear-to-t */}
          <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-linear-to-t from-red-900/5 to-transparent pointer-events-none z-0" />

          {/* Fixed: flex-grow -> grow */}
          <div className="grow flex flex-col items-center justify-center w-full px-4 sm:px-6 pt-32 pb-20 relative z-10">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-10 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <FaUsers /> Public Protocol
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                  Transcend {/* Fixed: bg-gradient-to-r -> bg-linear-to-r */}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 to-orange-500">
                    Community
                  </span>
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto leading-relaxed">
                  Distribute Mixed Assets (LSK, USDT, DAI) in a single
                  transaction.
                </p>
              </div>

              <DashboardForm />
            </div>
          </div>

          <div className="relative z-10 mt-auto border-t border-white/5 bg-[#050505]">
            <Footer />
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

interface RowData {
  address: string;
  amount: string;
  tokenType: "NATIVE" | "USDT" | "DAI";
}

function DashboardForm() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect(); // Hook koneksi

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();

  // FIX: Destructure 'data' as 'receipt' to access the actual on-chain status
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isTxMined,
  } = useWaitForTransactionReceipt({ hash });

  // FIX: Check receipt.status instead of the hook's status
  const isConfirmed = isTxMined && receipt?.status === "success";
  const isReverted = isTxMined && receipt?.status === "reverted";

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");
  const [rows, setRows] = useState<RowData[]>([
    { address: "", amount: "", tokenType: "NATIVE" },
  ]);
  const [totalUsdtNeeded, setTotalUsdtNeeded] = useState<bigint>(BigInt(0));
  const [totalDaiNeeded, setTotalDaiNeeded] = useState<bigint>(BigInt(0));
  const [csvPreview, setCsvPreview] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- FUNGSI CONNECT BARU UNTUK DASHBOARD ---
  const handleConnectDashboard = async () => {
    try {
      let connector = connectors.find((c) => c.id === "injected");

      // Fallback ke WalletConnect jika di mobile atau tidak ada injected provider
      if (
        !connector ||
        typeof window === "undefined" ||
        !(window as any).ethereum
      ) {
        connector = connectors.find((c) => c.id === "walletConnect");
      }

      if (connector) {
        await connectAsync({ connector, chainId: config.chains[0].id });
      } else {
        alert("Wallet Connector tidak ditemukan.");
      }
    } catch (err: any) {
      if (
        err.name === "UserRejectedRequestError" ||
        err.message.includes("User rejected") ||
        err.message.includes("rejected")
      ) {
        console.log("User cancelled connection");
        return;
      }
      console.error("Connect error:", err);
    }
  };
  // -------------------------------------------

  const { data: allowanceUSDT, refetch: refetchAllowanceUSDT } =
    useReadContract({
      abi: ERC20_ABI,
      address: USDT_ADDRESS,
      functionName: "allowance",
      args: address ? [address, CONTRACT_ADDRESS] : undefined,
      query: { enabled: totalUsdtNeeded > 0 },
    });

  const { data: allowanceDAI, refetch: refetchAllowanceDAI } = useReadContract({
    abi: ERC20_ABI,
    address: DAI_ADDRESS,
    functionName: "allowance",
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    query: { enabled: totalDaiNeeded > 0 },
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowanceUSDT();
      refetchAllowanceDAI();
    }
  }, [isConfirmed, refetchAllowanceUSDT, refetchAllowanceDAI]);

  useEffect(() => {
    let usdtTotal = BigInt(0);
    let daiTotal = BigInt(0);
    rows.forEach((row) => {
      if (row.amount && parseFloat(row.amount) > 0) {
        try {
          const val = parseEther(row.amount);
          if (row.tokenType === "USDT") usdtTotal += val;
          if (row.tokenType === "DAI") daiTotal += val;
        } catch {}
      }
    });
    setTotalUsdtNeeded(usdtTotal);
    setTotalDaiNeeded(daiTotal);
  }, [rows]);

  const addRow = () => {
    setRows([...rows, { address: "", amount: "", tokenType: "NATIVE" }]);
  };

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
    // @ts-ignore
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleTokenTypeChange = (
    index: number,
    type: "NATIVE" | "USDT" | "DAI"
  ) => {
    const newRows = [...rows];
    newRows[index].tokenType = type;
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
        // FIX: Gunakan Regex /[;,]/ untuk memisahkan berdasarkan koma ATAU titik koma
        const parts = line.split(/[;,]/).map((p) => p.trim());

        // Pastikan baris tidak kosong dan punya minimal 2 kolom
        if (parts.length >= 2 && parts[0] !== "") {
          const addr = parts[0];
          const amt = parts[1];
          // Ambil token dari kolom ke-3, default ke LSK jika kosong
          const symRaw = parts[2]?.toUpperCase() || "LSK";

          let tType: "NATIVE" | "USDT" | "DAI" = "NATIVE";
          if (symRaw.includes("USDT")) tType = "USDT";
          else if (symRaw.includes("DAI")) tType = "DAI";

          if (isAddress(addr) && !isNaN(parseFloat(amt))) {
            newRows.push({ address: addr, amount: amt, tokenType: tType });
          }
        }
      });

      if (newRows.length > 0) {
        setRows(newRows);
      } else {
        alert(
          "Format CSV tidak valid atau kosong. Pastikan menggunakan pemisah koma (,) atau titik koma (;)"
        );
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleApprove = (tokenAddress: `0x${string}`) => {
    writeContract({
      address: tokenAddress,
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
          alert(`Invalid address: ${row.address}`);
          return;
        }
        if (!row.amount || parseFloat(row.amount) <= 0) {
          alert(`Invalid amount for ${row.address}`);
          return;
        }

        recipients.push(row.address as `0x${string}`);

        const amountWei = parseEther(row.amount);
        amounts.push(amountWei);

        if (row.tokenType === "NATIVE") {
          tokens.push(ZERO_ADDRESS);
          totalValueNative += amountWei;
        } else if (row.tokenType === "USDT") {
          tokens.push(USDT_ADDRESS);
        } else if (row.tokenType === "DAI") {
          tokens.push(DAI_ADDRESS);
        }
      }

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: MULTI_SENDER_ABI,
        functionName: "multiPay",
        args: [recipients, tokens, amounts],
        value: totalValueNative,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const needsApproveUSDT =
    allowanceUSDT !== undefined && allowanceUSDT < totalUsdtNeeded;
  const needsApproveDAI =
    allowanceDAI !== undefined && allowanceDAI < totalDaiNeeded;
  const canSubmit = !isPending && !isConfirming;

  if (!mounted) return null;

  return (
    <div className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 border border-red-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="mb-8 flex justify-center sm:justify-start">
        <div className="flex gap-1 bg-[#151515] p-1.5 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => setMode("MANUAL")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              mode === "MANUAL"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Manual Input
          </button>
          <button
            onClick={() => setMode("CSV")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
              mode === "CSV"
                ? "bg-red-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Upload CSV
          </button>
        </div>
      </div>

      <div className="mb-8 min-h-[250px]">
        {mode === "MANUAL" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="grow">Recipient Address</div>
              <div className="w-32 text-right mr-4">Amount</div>
              <div className="w-24">Token</div>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {rows.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#151515] p-2 sm:p-3 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-[#1a1a1a] transition-all group/row shadow-sm"
                >
                  <div className="w-full sm:w-auto grow">
                    <input
                      type="text"
                      placeholder="0x... Address"
                      value={row.address}
                      onChange={(e) =>
                        handleInputChange(index, "address", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-600 font-mono text-sm px-3 py-2"
                    />
                  </div>
                  {/* Fixed: w-[1px] -> w-px */}
                  <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                  <div className="relative w-full sm:w-32">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={row.amount}
                      onChange={(e) =>
                        handleInputChange(index, "amount", e.target.value)
                      }
                      className="w-full bg-transparent border-none text-white focus:ring-0 placeholder-gray-600 text-right font-bold text-lg px-2"
                    />
                  </div>
                  <div className="relative w-full sm:w-28 flex items-center gap-2">
                    <div className="relative w-full">
                      <select
                        value={row.tokenType}
                        onChange={(e) =>
                          handleTokenTypeChange(
                            index,
                            e.target.value as "NATIVE" | "USDT" | "DAI"
                          )
                        }
                        className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-red-500 transition-colors cursor-pointer hover:bg-white/10"
                      >
                        <option
                          value="NATIVE"
                          className="bg-[#151515] text-white"
                        >
                          LSK
                        </option>
                        <option
                          value="USDT"
                          className="bg-[#151515] text-white"
                        >
                          USDT
                        </option>
                        <option value="DAI" className="bg-[#151515] text-white">
                          DAI
                        </option>
                      </select>
                      <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
                    </div>
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="text-gray-600 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addRow}
              className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2 text-sm font-bold mt-4 group"
            >
              <span className="bg-white/10 p-1 rounded-md group-hover:bg-red-500 group-hover:text-white transition-colors">
                <FaPlus size={10} />
              </span>{" "}
              Add Another Recipient
            </button>
          </div>
        )}

        {mode === "CSV" && (
          <div className="animate-fade-in h-full flex flex-col">
            <div className="relative grow group/textarea">
              <textarea
                readOnly
                value={csvPreview}
                placeholder={`Example Format:\n0x123...abc, 1.5, LSK\n0x456...def, 100, USDT\n0x789...ghi, 50, DAI`}
                className="w-full h-48 bg-[#151515] border border-white/10 rounded-2xl p-5 text-sm text-gray-300 placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none font-mono leading-relaxed transition-colors group-hover/textarea:border-white/20"
              />
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Fixed: bg-gradient-to-b -> bg-linear-to-b */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto bg-linear-to-b from-[#222] to-[#111] border border-white/10 hover:border-white/30 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <FaFileCsv className="text-gray-400" /> Choose File
              </button>
              <Link
                href="/dashboard/csv-guide"
                target="_blank"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 ml-auto group/link"
              >
                <FaCircleInfo className="text-red-500" /> CSV Format Guide{" "}
                <FaArrowUpRightFromSquare className="text-xs group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {(isConfirmed || writeError || isReverted) && (
        <div className="mb-6 animate-fade-in">
          {isConfirmed && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <div className="bg-green-500 text-black p-1.5 rounded-full">
                <FaCircleCheck size={16} />
              </div>
              <div>
                <p className="font-bold">Transaction Successful!</p>
                <p className="text-xs opacity-80">
                  Assets have been distributed to {rows.length} recipients.
                </p>
              </div>
            </div>
          )}

          {isReverted && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div className="bg-red-500 text-black p-1.5 rounded-full">
                <FaCircleExclamation size={16} />
              </div>
              <div>
                <p className="font-bold">Transaction Failed!</p>
                <p className="text-xs opacity-80">
                  The transaction was reverted on-chain. Please check token
                  balances and allowances.
                </p>
              </div>
            </div>
          )}

          {writeError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <div className="bg-red-500 text-black p-1.5 rounded-full">
                <FaCircleExclamation size={16} />
              </div>
              <p className="text-sm font-medium">
                {writeError.message.split("\n")[0]}
              </p>
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        // Fixed: bg-gradient-to-r -> bg-linear-to-r
        <button
          onClick={handleConnectDashboard}
          className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)] transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
        >
          <FaWallet /> Connect Wallet to Start
        </button>
      ) : needsApproveUSDT ? (
        <button
          onClick={() => handleApprove(USDT_ADDRESS)}
          disabled={!canSubmit}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-lg py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transform active:scale-[0.98]"
        >
          {isPending || isConfirming
            ? "Approving Access..."
            : `Approve USDT (${
                rows.filter((r) => r.tokenType === "USDT").length
              } Transfers)`}
        </button>
      ) : needsApproveDAI ? (
        <button
          onClick={() => handleApprove(DAI_ADDRESS)}
          disabled={!canSubmit}
          className="w-full bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-lg py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] transform active:scale-[0.98]"
        >
          {isPending || isConfirming
            ? "Approving Access..."
            : `Approve DAI (${
                rows.filter((r) => r.tokenType === "DAI").length
              } Transfers)`}
        </button>
      ) : (
        // Fixed: bg-gradient-to-r -> bg-linear-to-r
        <button
          onClick={handleMultiPay}
          disabled={!canSubmit}
          className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-lg py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          {isPending || isConfirming ? (
            "Processing Transaction..."
          ) : (
            <>
              <FaRocket className="group-hover:rotate-12 transition-transform" />{" "}
              Transfer {rows.length} Asset{rows.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}
