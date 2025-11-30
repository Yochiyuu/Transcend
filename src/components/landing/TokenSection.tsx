// src/components/landing/TokenSection.tsx
"use client";

import { useState } from "react";
import { FaCheck, FaCoins, FaCopy } from "react-icons/fa6";
// REQUIRED: Import addresses from abi.ts file
import { DAI_ADDRESS, USDT_ADDRESS } from "@/utils/abi";

// --- Token Data ---
const tokens = [
  {
    name: "USDT",
    symbol: "mUSDT",
    address: USDT_ADDRESS,
    title: "Mock USDT: The Stability You Need.",
    description:
      "Mock USDT (mUSDT) is our premier ERC-20 stablecoin designed for instant settlement and zero-volatility testing within the Transcend ecosystem.",
    color: "red",
  },
  {
    name: "DAI",
    symbol: "mDAI",
    address: DAI_ADDRESS,
    title: "Mock DAI: The Corporate Asset Standard.",
    description:
      "Mock DAI (mDAI) is an ERC-20 token serving as a versatile, decentralized asset for corporate payments and treasury operations.",
    color: "amber",
  },
];

const TokenCard = ({ token }: { token: (typeof tokens)[0] }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Implementation to copy address
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = `${token.address.slice(0, 6)}...${token.address.slice(
    -4
  )}`;

  return (
    <div className="space-y-8 p-6 md:p-8 bg-white/5 border border-white/10 rounded-3xl shadow-xl relative backdrop-blur-md">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-${token.color}-500/30 bg-${token.color}-500/10 text-${token.color}-400 text-sm font-semibold`}
      >
        <FaCoins /> <span>{token.name}</span>
      </div>
      <h2 className="text-3xl font-bold leading-snug">
        {token.title.split(":")[0]}{" "}
        <span className={`text-${token.color}-500`}>
          {token.title.split(":")[1]}
        </span>
      </h2>
      <p className="text-gray-300 leading-relaxed text-sm">
        {token.description}
      </p>

      {/* Contract Address Section */}
      <div className="bg-black/50 rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
          Smart Contract Address ({token.symbol})
        </p>
        <div className="flex items-center justify-between gap-4">
          <code
            className={`font-mono text-sm sm:text-base truncate text-${token.color}-400`}
          >
            {shortAddress}
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

      {/* Visual Token Circle */}
      <div className="relative w-full flex justify-center py-4">
        <div
          className={`relative w-40 h-40 bg-gradient-to-br from-${token.color}-600/80 to-black/50 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-white/10 backdrop-blur-sm`}
        >
          <div className="absolute inset-2 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
              $
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TokenSection() {
  return (
    <section id="token" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Token <span className="text-red-500">Assets</span>
        </h2>
        <p className="text-gray-300 text-lg">
          Simulated stable assets for enterprise transaction testing.
        </p>
      </div>

      {/* TOKEN CARD GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {tokens.map((token, i) => (
          <TokenCard key={i} token={token} />
        ))}
      </div>
    </section>
  );
}
