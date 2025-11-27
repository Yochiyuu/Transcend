"use client";

import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What makes Mock USDT different from regular USDT?",
      a: "Mock USDT is a testnet-native stablecoin optimized for the Transcend ecosystem. It allows developers and users to simulate transactions with zero financial risk before going live on Mainnet.",
    },
    {
      q: "Is the Enterprise plan customizable?",
      a: "Absolutely. Our Enterprise solutions are tailored to your specific transaction volume and security requirements. We offer bespoke API limits, multi-sig vaults, and dedicated SLA guarantees.",
    },
    {
      q: "How secure is the platform?",
      a: "We utilize industry-leading encryption and multi-signature wallet architecture. Our smart contracts undergo rigorous audits by top-tier security firms to ensure maximum fund safety.",
    },
    {
      q: "Can I integrate Transcend into my existing dApp?",
      a: "Yes! We provide comprehensive SDKs and REST APIs designed for seamless integration into any React, Vue, or Node.js environment. Check our documentation for code snippets.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              onClick={() => toggleFaq(i)}
              className={`group border rounded-2xl p-1 transition-all duration-300 cursor-pointer ${
                openFaq === i
                  ? "bg-gradient-to-r from-red-900/20 to-black/40 border-red-500/50"
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="px-6 py-4 flex justify-between items-center">
                <h3
                  className={`text-lg md:text-xl font-medium transition-colors ${
                    openFaq === i
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {faq.q}
                </h3>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openFaq === i
                      ? "bg-red-500 text-white rotate-180"
                      : "bg-white/10 text-gray-400 group-hover:bg-white/20"
                  }`}
                >
                  {openFaq === i ? <FaMinus size={12} /> : <FaPlus size={12} />}
                </div>
              </div>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaq === i
                    ? "grid-rows-[1fr] opacity-100 pb-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden px-6">
                  <p className="text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
