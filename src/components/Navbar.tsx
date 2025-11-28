"use client";

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

// Load Font
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export default function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();

  const { data: balanceData } = useBalance({
    address: address,
  });

  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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

  // Menu Items
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
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl transition-all duration-300 ${spaceGrotesk.className}`}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between py-4 px-6 md:px-8">
        {/* --- LEFT: LOGO --- */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-red-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <Image
                src="/logo.png"
                alt="Transcend Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain relative z-10"
              />
            </div>
            <span className="text-xl font-bold italic tracking-tight text-white group-hover:text-red-500 transition-colors">
              Transcend
            </span>
          </Link>

          {/* --- MIDDLE: NAVIGATION (Desktop) --- */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: WALLET ACTION --- */}
        <div className="flex items-center gap-4">
          {mounted ? (
            <>
              {!isConnected ? (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-bold text-white transition-all duration-300 bg-red-600 rounded-xl hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                  <span className="relative flex items-center gap-2">
                    <FaWallet /> Connect Wallet
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Network Badge */}
                  <div className="hidden lg:flex items-center gap-2 bg-[#1A1A1D] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                    {chain?.name || "Lisk Sepolia"}
                  </div>

                  {/* Wallet Widget */}
                  <div className="flex items-center bg-[#1A1A1D] border border-white/10 rounded-xl p-1 shadow-lg">
                    {/* Balance Section */}
                    <div className="hidden sm:flex items-center px-3 border-r border-white/5">
                      <span className="text-sm font-bold text-gray-200">
                        {formattedBalance}{" "}
                        <span className="text-red-500 text-xs ml-0.5">
                          {balanceData?.symbol}
                        </span>
                      </span>
                    </div>

                    {/* Address Section (Copy) */}
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/addr"
                      title="Copy Address"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
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

                    {/* Disconnect Button */}
                    <button
                      onClick={() => disconnect()}
                      className="ml-1 p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-l border-white/5"
                      title="Disconnect"
                    >
                      <FaPowerOff className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Loading Skeleton
            <div className="w-36 h-10 bg-white/5 rounded-xl animate-pulse"></div>
          )}
        </div>
      </div>
    </nav>
  );
}
