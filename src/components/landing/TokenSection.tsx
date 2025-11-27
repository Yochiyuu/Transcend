"use client";

import { useState } from "react";
import { FaCheck, FaCoins, FaCopy } from "react-icons/fa6";

export default function TokenSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="token" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold">
            <FaCoins /> <span>Native Stablecoin</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Meet <span className="text-red-500">Mock USDT</span> <br />
            The Stability You Need.
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Mock USDT (mUSDT) is our premier ERC-20 stablecoin designed for
            instant settlement and zero-volatility testing within the Transcend
            ecosystem.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md max-w-md">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Smart Contract Address
            </p>
            <div className="flex items-center justify-between gap-4 bg-black/50 rounded-lg px-4 py-3 border border-white/5">
              <code className="text-red-400 font-mono text-sm sm:text-base truncate">
                0x71C...92F8A1
              </code>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                title="Copy Address"
              >
                {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-red-600/80 to-black/50 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(220,38,38,0.4)] border border-white/10 animate-[float_6s_ease-in-out_infinite] backdrop-blur-sm">
            <div className="absolute inset-2 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md">
              <span className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                $
              </span>
            </div>
            <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
