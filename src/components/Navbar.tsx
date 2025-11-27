// src/components/Navbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { formatUnits } from "viem";
import { FaEthereum } from "react-icons/fa";

export default function Navbar() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: balanceData } = useBalance({
    address: address,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formattedBalance = balanceData 
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4) 
    : "0";

  return (
    <nav className="flex items-center justify-between py-6 px-8 relative z-10">
      {/* --- LOGO SECTION --- */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Transcend Logo"
          width={40}
          height={40}
          className="w-10 h-10 object-contain"
        />
        <span className="text-xl font-bold tracking-wide text-white italic">
          Transcend
        </span>
      </Link>

      {/* --- NAVIGATION LINKS --- */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
        {["Product", "Verification", "Token", "Partnership"].map((item) => (
          <a
            key={item}
            href="#"
            className="hover:text-primary transition hover:drop-shadow-[0_0_5px_rgba(255,59,71,0.8)]"
          >
            {item}
          </a>
        ))}
      </div>

      {/* --- RIGHT SECTION (Network & Wallet) --- */}
      <div className="flex gap-4 items-center">
        
        {/* Network Badge - FIXED HYDRATION ERROR */}
        <div className="hidden sm:flex items-center gap-2 border border-[#3f1215] bg-[#1a0b0c] px-4 py-2.5 rounded-lg text-sm font-medium text-[#ff3b47] shadow-inner shadow-red-900/20">
          <FaEthereum className="text-lg" />
          {/* Hanya render nama chain jika sudah mounted */}
          <span>
            {mounted && chain?.name ? chain.name : "Lisk Sepolia"}
          </span>
        </div>

        {mounted ? (
          !isConnected ? (
            // Tombol Connect
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-[#ff3b47] hover:bg-[#e63540] text-white border border-[#ff3b47] px-6 py-2.5 rounded-lg text-sm font-bold transition shadow-[0_0_15px_rgba(255,59,71,0.4)]"
            >
              Connect Wallet
            </button>
          ) : (
            // Tampilan Wallet
            <div className="flex items-center border border-[#3f1215] bg-[#1a0b0c] p-1 rounded-lg shadow-inner shadow-red-900/20">
              
              <div className="px-3 text-sm font-bold text-[#ff3b47]">
                {formattedBalance} {balanceData?.symbol}
              </div>

              <button
                onClick={() => disconnect()}
                className="bg-[#3f1215] hover:bg-[#5c1a1f] text-gray-200 px-3 py-1.5 rounded-md text-sm font-mono transition border border-transparent hover:border-red-900/50"
                title="Click to Disconnect"
              >
                {shortenAddress(address as string)}
              </button>
            </div>
          )
        ) : (
          // Loading State
          <div className="w-[140px] h-[42px] bg-[#1a0b0c] border border-[#3f1215] rounded-lg animate-pulse"></div>
        )}
      </div>
    </nav>
  );
}