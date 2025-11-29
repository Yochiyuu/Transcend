// src/app/enterprise/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/landing/Footer";
import {
  DAI_ADDRESS,
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
  FaCircleExclamation, // Menggunakan FaGears (pengganti FaCogs)
  FaFileCsv,
  FaGears,
  FaLandmark,
  FaLock,
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
          <div className="fixed top-0 left-0 w-full h-[800px] bg-linear-to-b from-yellow-900/20 via-amber-900/10 to-transparent pointer-events-none z-0" />
          <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-linear-to-t from-yellow-900/10 to-transparent pointer-events-none" />

          <div className="grow w-full px-4 sm:px-8 pt-32 pb-20 relative z-10 flex flex-col items-center">
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
          <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 via-yellow-500 to-amber-600">
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
  token: `0x${string}`;
}

function EnterpriseManager() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false); // Toggle Admin Panel

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
      <div className="flex flex-col items-center justify-center py-24 border border-yellow-900/30 rounded-3xl bg-linear-to-b from-yellow-900/10 to-black backdrop-blur-sm w-full max-w-2xl mx-auto">
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

  return (
    <>
      <EnterpriseDashboard />

      {/* ADMIN TOGGLE BUTTON (HIDDEN BOTTOM LEFT) */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="p-3 bg-gray-900/80 hover:bg-red-900/80 text-gray-500 hover:text-white rounded-full transition-all border border-white/10 shadow-lg"
          title="Toggle Admin/Demo Panel"
        >
          {showAdmin ? <FaLock /> : <FaGears />}
        </button>
      </div>

      {/* ADMIN PANEL */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}

// --- ADMIN / DEMO PANEL COMPONENT (FIXED) ---
function AdminPanel({ onClose }: { onClose: () => void }) {
  // FIX: Panggil address dari useAccount disini
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const { data: lendingPoolAddress } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "lendingPool",
  });

  const handleWhitelist = (token: `0x${string}`, symbol: string) => {
    writeContract({
      address: ENTERPRISE_ADDRESS,
      abi: ENTERPRISE_ABI,
      functionName: "setTokenWhitelist",
      args: [token, true],
    });
  };

  // FIX: Gunakan recordYield agar aman jika lending pool 0x0
  const handleInjectYield = (token: `0x${string}`) => {
    if (!address) return alert("Wallet not connected");

    writeContract({
      address: ENTERPRISE_ADDRESS,
      abi: ENTERPRISE_ABI,
      functionName: "recordYield",
      args: [address, token, parseEther("500")], // Tambah 500 Token Yield
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-red-500 mb-1 flex items-center gap-2">
          <FaGears /> Admin / Demo Panel
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Use this to setup your demo environment quickly.
        </p>

        <div className="space-y-6">
          {/* 1. WHITELIST SECTION */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              1. Whitelist Tokens
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleWhitelist(USDT_ADDRESS, "USDT")}
                disabled={isPending}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded text-xs text-gray-300 transition-colors"
              >
                Whitelist USDT
              </button>
              <button
                onClick={() => handleWhitelist(DAI_ADDRESS, "DAI")}
                disabled={isPending}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-2 rounded text-xs text-gray-300 transition-colors"
              >
                Whitelist DAI
              </button>
            </div>
          </div>

          {/* 2. YIELD SECTION */}
          <div>
            <p className="text-sm font-bold text-white mb-2">
              2. Inject Mock Yield (+500)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInjectYield(USDT_ADDRESS)}
                disabled={isPending}
                className="bg-green-900/20 hover:bg-green-900/40 border border-green-500/20 p-2 rounded text-xs text-green-400 transition-colors"
              >
                Inject USDT Yield
              </button>
              <button
                onClick={() => handleInjectYield(DAI_ADDRESS)}
                disabled={isPending}
                className="bg-orange-900/20 hover:bg-orange-900/40 border border-orange-500/20 p-2 rounded text-xs text-orange-400 transition-colors"
              >
                Inject DAI Yield
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
        <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-l from-yellow-600 via-yellow-300 to-transparent"></div>

        <div className="w-24 h-24 bg-linear-to-br from-yellow-600 to-yellow-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-yellow-900/50 transform rotate-3 hover:rotate-0 transition-all duration-500">
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
          className="w-full bg-linear-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg py-5 rounded-xl transition-all shadow-lg shadow-yellow-600/20 hover:shadow-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
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
  const [withdrawAmount, setWithdrawAmount] = useState(""); // State baru untuk withdraw

  // STATE UNTUK TREASURY VIEW (Kiri)
  const [treasuryViewToken, setTreasuryViewToken] =
    useState<`0x${string}`>(USDT_ADDRESS);
  const treasurySymbol = treasuryViewToken === USDT_ADDRESS ? "USDT" : "DAI";

  // WRITE DEPOSIT
  const {
    writeContract: writeDeposit,
    isPending: isDepPending,
    data: depHash,
  } = useWriteContract();
  const { isLoading: isDepConfirming } = useWaitForTransactionReceipt({
    hash: depHash,
  });

  // WRITE WITHDRAW
  const {
    writeContract: writeWithdraw,
    isPending: isWithPending,
    data: withHash,
  } = useWriteContract();
  const { isLoading: isWithConfirming } = useWaitForTransactionReceipt({
    hash: withHash,
  });

  const [mode, setMode] = useState<"MANUAL" | "CSV">("MANUAL");
  const [rows, setRows] = useState<RowData[]>([
    { address: "", amount: "", token: USDT_ADDRESS },
  ]);
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

  // READ DATA (Allowance & Yield)
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    abi: ERC20_ABI,
    address: treasuryViewToken,
    functionName: "allowance",
    args: address ? [address, ENTERPRISE_ADDRESS] : undefined,
  });

  const { data: yieldUSDT, refetch: refetchYieldUSDT } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "getYield",
    args: address ? [address, USDT_ADDRESS] : undefined,
  });

  const { data: yieldDAI, refetch: refetchYieldDAI } = useReadContract({
    abi: ENTERPRISE_ABI,
    address: ENTERPRISE_ADDRESS,
    functionName: "getYield",
    args: address ? [address, DAI_ADDRESS] : undefined,
  });

  const displayYield =
    treasuryViewToken === USDT_ADDRESS ? yieldUSDT : yieldDAI;

  const depositValueBigInt = depositAmount
    ? parseEther(depositAmount)
    : BigInt(0);
  const needsApproval =
    allowance !== undefined && allowance < depositValueBigInt;

  // HANDLERS
  const handleApprove = () =>
    writeDeposit({
      address: treasuryViewToken,
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
        args: [treasuryViewToken, parseEther(depositAmount)],
      });
  };

  const handleWithdraw = () => {
    if (withdrawAmount)
      writeWithdraw({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "withdraw",
        args: [treasuryViewToken, parseEther(withdrawAmount)],
      });
  };

  // --- GAS OPTIMIZED MULTI-TOKEN PAYROLL ---
  const handleExecutePayroll = () => {
    try {
      // 1. Grouping Data berdasarkan Token
      const tokenGroups: Record<
        string,
        { recipients: `0x${string}`[]; amounts: bigint[] }
      > = {};

      let totalUSDTNeeded = 0n;
      let totalDAINeeded = 0n;

      for (const row of rows) {
        if (
          !isAddress(row.address) ||
          !row.amount ||
          parseFloat(row.amount) <= 0
        ) {
          alert(`Invalid input for ${row.address}`);
          return;
        }

        const token = row.token;
        const amountWei = parseEther(row.amount);

        if (token === USDT_ADDRESS) totalUSDTNeeded += amountWei;
        if (token === DAI_ADDRESS) totalDAINeeded += amountWei;

        if (!tokenGroups[token]) {
          tokenGroups[token] = { recipients: [], amounts: [] };
        }
        tokenGroups[token].recipients.push(row.address as `0x${string}`);
        tokenGroups[token].amounts.push(amountWei);
      }

      // 2. Cek Saldo Yield
      const usdtAvailable = yieldUSDT || 0n;
      const daiAvailable = yieldDAI || 0n;

      if (totalUSDTNeeded > usdtAvailable) {
        alert("Insufficient USDT Yield Balance in Enterprise Pool");
        return;
      }
      if (totalDAINeeded > daiAvailable) {
        alert("Insufficient DAI Yield Balance in Enterprise Pool");
        return;
      }

      // 3. Prepare Arrays untuk executePayrollMulti
      const tokensList = Object.keys(tokenGroups) as `0x${string}`[];
      const recipientsList = tokensList.map((t) => tokenGroups[t].recipients);
      const amountsList = tokensList.map((t) => tokenGroups[t].amounts);

      // 4. Kirim Transaksi
      writePayroll({
        address: ENTERPRISE_ADDRESS,
        abi: ENTERPRISE_ABI,
        functionName: "executePayrollMulti",
        args: [tokensList, recipientsList, amountsList],
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
        if (p.length >= 2 && isAddress(p[0]) && !isNaN(parseFloat(p[1]))) {
          const sym = p[2]?.toUpperCase();
          let token: `0x${string}` = USDT_ADDRESS;
          if (sym === "DAI") token = DAI_ADDRESS;
          newRows.push({ address: p[0], amount: p[1], token });
        }
      });
      if (newRows.length > 0) setRows(newRows);
    };
    reader.readAsText(file);
  };

  const addRow = () =>
    setRows([...rows, { address: "", amount: "", token: USDT_ADDRESS }]);
  const removeRow = (i: number) => {
    const n = [...rows];
    n.splice(i, 1);
    setRows(n);
  };
  const handleInputChange = (i: number, f: keyof RowData, v: string) => {
    const n = [...rows];
    // @ts-ignore
    n[i][f] = v;
    setRows(n);
  };

  const totalPayrollUSDT = rows
    .filter((r) => r.token === USDT_ADDRESS)
    .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
  const totalPayrollDAI = rows
    .filter((r) => r.token === DAI_ADDRESS)
    .reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);

  useEffect(() => {
    if (!isDepConfirming || !isWithConfirming) {
      refetchAllowance();
      refetchYieldUSDT();
      refetchYieldDAI();
    }
  }, [isDepConfirming, isWithConfirming, treasuryViewToken]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
      {/* --- LEFT: GOLD VAULT (TREASURY MANAGEMENT) --- */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#0A0A0A] border border-yellow-600/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group h-full flex flex-col">
          <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 to-transparent pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-linear-to-b from-yellow-400 to-yellow-700 rounded-lg flex items-center justify-center text-black shadow-lg">
                <FaLandmark />
              </span>
              Treasury
            </h3>

            {/* VIEW SELECTOR */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-yellow-500/20 backdrop-blur-sm">
              <button
                onClick={() => setTreasuryViewToken(USDT_ADDRESS)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  treasuryViewToken === USDT_ADDRESS
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "text-gray-500 hover:text-yellow-500"
                }`}
              >
                {treasuryViewToken === USDT_ADDRESS && <FaCheck size={8} />}{" "}
                USDT
              </button>
              <button
                onClick={() => setTreasuryViewToken(DAI_ADDRESS)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center gap-2 ${
                  treasuryViewToken === DAI_ADDRESS
                    ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                    : "text-gray-500 hover:text-yellow-500"
                }`}
              >
                {treasuryViewToken === DAI_ADDRESS && <FaCheck size={8} />} DAI
              </button>
            </div>
          </div>

          {/* BALANCE CARD */}
          <div className="bg-linear-to-r from-[#1a1500] to-black border border-yellow-800/30 rounded-2xl p-6 mb-8 relative">
            <p className="text-xs text-yellow-600 font-bold tracking-[0.2em] uppercase mb-2">
              Accumulated Yield
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm">
                +{displayYield ? formatEther(displayYield) : "0.00"}
              </span>
              <span className="text-sm text-yellow-700 font-bold">
                {treasurySymbol}
              </span>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* DEPOSIT SECTION */}
          <div className="space-y-4 relative z-10 mb-8 border-b border-white/5 pb-8">
            <div className="relative group/input">
              <input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#050505] border border-yellow-900/40 rounded-xl px-5 py-4 text-white focus:border-yellow-500 outline-none text-lg font-mono transition-colors group-hover/input:border-yellow-700/60"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-600 bg-yellow-900/10 px-2 py-1 rounded">
                DEP {treasurySymbol}
              </span>
            </div>

            {needsApproval ? (
              <button
                onClick={handleApprove}
                disabled={isDepPending || isDepConfirming}
                className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(202,138,4,0.2)]"
              >
                {isDepPending ? "Approving Access..." : "1. Approve Contract"}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isDepPending || isDepConfirming || !depositAmount}
                className="w-full bg-linear-to-r from-white to-gray-300 hover:from-white hover:to-white text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isDepPending || isDepConfirming
                  ? "Processing Deposit..."
                  : "2. Deposit to Pool"}
              </button>
            )}
          </div>

          {/* WITHDRAW SECTION (ADDED) */}
          <div className="space-y-4 relative z-10 mt-auto">
            <div className="relative group/input">
              <input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-red-500 outline-none text-lg font-mono transition-colors"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">
                W/D {treasurySymbol}
              </span>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithPending || isWithConfirming || !withdrawAmount}
              className="w-full bg-white/5 hover:bg-red-900/20 hover:border-red-500/50 border border-white/10 text-gray-300 hover:text-red-400 font-bold py-3 rounded-xl transition-all"
            >
              {isWithPending || isWithConfirming
                ? "Withdrawing..."
                : "Withdraw Assets"}
            </button>
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
                Batch process salary distribution. (Multi-Token Supported)
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
                    <div className="w-8 h-8 rounded-full bg-yellow-900/20 text-yellow-600 flex items-center justify-center font-mono text-xs border border-yellow-900/30 shrink-0">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="Recipient Wallet (0x...)"
                      value={row.address}
                      onChange={(e) =>
                        handleInputChange(index, "address", e.target.value)
                      }
                      className="grow w-full sm:w-auto bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none font-mono"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative w-[140px]">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={row.amount}
                          onChange={(e) =>
                            handleInputChange(index, "amount", e.target.value)
                          }
                          className="w-full bg-[#111] border border-white/10 rounded-xl pl-8 pr-3 py-3 text-sm text-white focus:border-yellow-500 outline-none font-bold text-right"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                          $
                        </span>
                      </div>

                      {/* --- ROW TOKEN SELECTOR --- */}
                      <select
                        value={row.token}
                        onChange={(e) =>
                          handleInputChange(index, "token", e.target.value)
                        }
                        className="bg-[#111] border border-white/10 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-yellow-500 cursor-pointer"
                      >
                        <option value={USDT_ADDRESS}>USDT</option>
                        <option value={DAI_ADDRESS}>DAI</option>
                      </select>

                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(index)}
                          className="w-12 bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/20 rounded-xl flex items-center justify-center transition-colors shrink-0"
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
                  Upload your payroll CSV file. <br />
                  Format: <code>address, amount, SYMBOL</code> (e.g. DAI/USDT)
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="space-y-1">
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                  Total Allocation
                </p>
                <div className="flex gap-4">
                  {totalPayrollUSDT > 0 && (
                    <p className="text-2xl font-bold text-white">
                      {totalPayrollUSDT.toLocaleString()}{" "}
                      <span className="text-yellow-500 text-sm">USDT</span>
                    </p>
                  )}
                  {totalPayrollDAI > 0 && (
                    <p className="text-2xl font-bold text-white">
                      {totalPayrollDAI.toLocaleString()}{" "}
                      <span className="text-orange-500 text-sm">DAI</span>
                    </p>
                  )}
                  {totalPayrollUSDT === 0 && totalPayrollDAI === 0 && (
                    <p className="text-2xl font-bold text-gray-600">0.00</p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                  Pool Status
                </p>
                {/* Visualizer Status Sederhana */}
                <div className="flex flex-col items-end gap-1">
                  {totalPayrollUSDT > 0 && (
                    <p
                      className={`text-xs font-bold ${
                        parseFloat(formatEther(yieldUSDT || 0n)) >=
                        totalPayrollUSDT
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      USDT:{" "}
                      {parseFloat(formatEther(yieldUSDT || 0n)) >=
                      totalPayrollUSDT
                        ? "Covered"
                        : "Insufficient"}
                    </p>
                  )}
                  {totalPayrollDAI > 0 && (
                    <p
                      className={`text-xs font-bold ${
                        parseFloat(formatEther(yieldDAI || 0n)) >=
                        totalPayrollDAI
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      DAI:{" "}
                      {parseFloat(formatEther(yieldDAI || 0n)) >=
                      totalPayrollDAI
                        ? "Covered"
                        : "Insufficient"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isPaySuccess && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3">
                <FaCheck /> Batch Transaction Successful
              </div>
            )}
            {payError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
                <FaCircleExclamation /> {payError.message.split("\n")[0]}
              </div>
            )}

            <button
              onClick={handleExecutePayroll}
              disabled={
                isPayPending ||
                isPayConfirming ||
                (totalPayrollUSDT <= 0 && totalPayrollDAI <= 0)
              }
              className="w-full bg-linear-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-400 text-black font-extrabold text-lg py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-[0.99]"
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
