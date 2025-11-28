// src/app/dashboard/csv-guide/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import { config } from "@/utils/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FaCircleInfo, FaFileCsv } from "react-icons/fa6";
import { WagmiProvider } from "wagmi";

const queryClient = new QueryClient();

export default function CsvGuidePage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className="min-h-screen text-white font-sans flex flex-col bg-[#080808]">
          <Navbar />

          {/* PERBAIKAN: Menggunakan Inline Style 'paddingTop: 180px' 
              Ini memaksa konten turun 180px dari atas, melewati tinggi Navbar (~80px)
          */}
          <div
            className="flex-1 p-6 sm:p-12 max-w-4xl mx-auto w-full"
            style={{ paddingTop: "130px" }}
          >
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6">
              <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <FaFileCsv className="text-red-500" /> CSV Upload Guide
              </h1>
              <p className="text-gray-400">
                Follow the instructions below to format your CSV file correctly
                for bulk transfers.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {/* Section 1: Format Rules */}
              <section className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaCircleInfo className="text-red-500 text-sm" /> File Rules
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
                  <li>
                    File extension must be <code>.csv</code>.
                  </li>
                  <li>
                    Do <strong>not</strong> include a header row (column names).
                  </li>
                  <li>Each row represents one transaction.</li>
                  <li>
                    Use <strong>comma (,)</strong> as the delimiter.
                  </li>
                </ul>
              </section>

              {/* Section 2: Columns Structure */}
              <section className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Column Structure
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-white uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Column 1</th>
                        <th className="px-4 py-3">Column 2</th>
                        <th className="px-4 py-3">Column 3 (Optional)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="bg-white/5">
                        <td className="px-4 py-3 font-mono text-red-400">
                          Wallet Address
                        </td>
                        <td className="px-4 py-3 font-mono text-white">
                          Amount
                        </td>
                        <td className="px-4 py-3 font-mono text-yellow-400">
                          Token Symbol
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">0x123...abc</td>
                        <td className="px-4 py-3">1.5</td>
                        <td className="px-4 py-3">LSK</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 3: Example Data */}
              <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-3">
                    Example 1: Native Token (LSK)
                  </h3>
                  <div className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
                    0x71C...976F, 0.5, LSK
                    <br />
                    0x39C...99A1, 1.2, ETH
                    <br />
                    0x12A...BCDE, 10
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    *If column 3 is empty, it defaults to Native Token (LSK).
                  </p>
                </div>

                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-3">
                    Example 2: Mixed Tokens
                  </h3>
                  <div className="bg-black/50 p-4 rounded-lg border border-white/5 font-mono text-xs text-gray-400">
                    0x71C...976F, 0.5, LSK
                    <br />
                    0x82A...12B4, 100, USDT
                    <br />
                    0x55D...11X9, 50, USDT
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    *Use "USDT" for Mock USDT transfers.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
