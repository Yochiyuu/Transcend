// src/components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="flex items-center justify-between py-6 px-8 relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md transform rotate-45"></div>
        <span className="text-xl font-bold tracking-wide text-white">
          Transcend
        </span>
      </div>

      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
        <a href="#" className="hover:text-primary transition">
          Product
        </a>
        <a href="#" className="hover:text-primary transition">
          Verification
        </a>
        <a href="#" className="hover:text-primary transition">
          Token
        </a>
        <a href="#" className="hover:text-primary transition">
          Partnership
        </a>
      </div>

      <div className="flex gap-4 items-center">
        <div className="hidden sm:flex items-center gap-2 bg-input border border-border px-4 py-2 rounded-lg text-sm text-white">
          <span className="w-2 h-2 bg-primary rounded-full"></span>
          <span>Lisk Sepolia</span>
        </div>

        {mounted ? (
          !isConnected ? (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-lg text-sm font-bold transition"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex gap-2">
              <button className="bg-input border border-border px-4 py-2 rounded-lg text-sm font-mono text-white">
                {shortenAddress(address as string)}
              </button>
              <button
                onClick={() => disconnect()}
                className="text-red-500 hover:text-red-400 text-sm px-2 border border-border rounded-lg"
              >
                ✕
              </button>
            </div>
          )
        ) : (
          <div className="w-[140px] h-[38px] bg-input rounded-lg animate-pulse"></div>
        )}
      </div>
    </nav>
  );
}
