// src/components/Navbar.tsx
"use client";

import { config } from "@/utils/config";
import { Space_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaChartPie,
  FaCheck,
  FaClockRotateLeft,
  FaCopy,
  FaPowerOff,
  FaWallet,
} from "react-icons/fa6";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();

  const { data: balanceData } = useBalance({ address });
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    try {
      // --- LOGIKA BARU: SMART SELECTION ---
      // 1. Coba cari Injected (Metamask Extension di PC)
      let connector = connectors.find((c) => c.id === "injected");

      // 2. Jika Injected tidak ready (misal di HP Chrome), gunakan WalletConnect
      // WalletConnect (Reown) bisa handle QR Code (PC) dan Deep Link (HP)
      if (
        !connector ||
        typeof window === "undefined" ||
        !(window as any).ethereum
      ) {
        connector = connectors.find((c) => c.id === "walletConnect");
      }

      if (!connector) {
        alert("Tidak ada metode koneksi yang tersedia.");
        return;
      }

      // 3. Disconnect sesi lama jika ada
      if (isConnected) {
        await disconnect();
      }

      // 4. Eksekusi Connect
      await connectAsync({
        connector,
        chainId: config.chains[0].id,
      });
    } catch (err: any) {
      if (
        err.name === "UserRejectedRequestError" ||
        err.message.includes("User rejected") ||
        err.message.includes("rejected")
      ) {
        console.log("User membatalkan koneksi.");
        return;
      }
      console.error("Connect Error:", err);
      // alert("Gagal connect: " + err.message); // Opsional: matikan alert jika mengganggu
    }
  };

  const shortenAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedBalance = balanceData
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(
        4
      )
    : "0";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <FaChartPie /> },
    { name: "Enterprise", href: "/enterprise", icon: <FaBuilding /> },
    {
      name: "History",
      href: "/dashboard/history",
      icon: <FaClockRotateLeft />,
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/90 backdrop-blur-xl transition-all duration-300 ${spaceGrotesk.className}`}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between py-4 px-6 md:px-8">
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Image
                src="/logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain relative z-10"
                priority
                unoptimized
              />
            </div>
            <span className="text-xl font-bold italic tracking-tight text-white group-hover:text-red-500 transition-colors hidden sm:block">
              Transcend
            </span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* WALLET ACTION */}
        <div className="flex items-center gap-4">
          {mounted ? (
            !isConnected ? (
              <button
                onClick={handleConnect} // <--- PASTIKAN INI TERPANGGIL
                className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white transition-all duration-300 bg-red-600 rounded-xl hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 cursor-pointer"
              >
                <span className="relative flex items-center gap-2">
                  <FaWallet /> Connect Wallet
                </span>
              </button>
            ) : (
              <div className="flex items-center bg-[#1A1A1D] border border-white/10 rounded-xl p-1 shadow-lg">
                <div className="hidden sm:flex items-center px-3 border-r border-white/5">
                  <span className="text-sm font-bold text-gray-200">
                    {formattedBalance}{" "}
                    <span className="text-red-500 text-xs ml-0.5">
                      {balanceData?.symbol}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/addr cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                    {address?.slice(2, 4)}
                  </div>
                  <span className="text-sm font-mono text-gray-300 group-hover/addr:text-white transition-colors">
                    {shortenAddress(address as string)}
                  </span>
                  {copied ? (
                    <FaCheck className="text-green-500 text-xs" />
                  ) : (
                    <FaCopy className="text-gray-500 group-hover/addr:text-white text-xs transition-colors" />
                  )}
                </button>
                <button
                  onClick={() => disconnect()}
                  className="ml-1 p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-l border-white/5 cursor-pointer"
                >
                  <FaPowerOff className="text-sm" />
                </button>
              </div>
            )
          ) : (
            <div className="w-36 h-10 bg-white/5 rounded-xl animate-pulse"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
