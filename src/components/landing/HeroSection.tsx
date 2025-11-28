// src/components/landing/HeroSection.tsx
import Link from "next/link";
import { FaArrowRight, FaRocket } from "react-icons/fa6";

export default function HeroSection() {
  return (
    // PERBAIKAN:
    // 1. min-h-screen: Agar tinggi section minimal setinggi layar device.
    // 2. flex & justify-center: Agar konten berada persis di tengah layar.
    // 3. pt-20: Padding atas disesuaikan agar pas di tengah (tidak terlalu turun karena pt-40 sebelumnya).
    <section className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-10 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full min-h-screen">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs sm:text-sm font-medium text-gray-300 mb-6 sm:mb-8 animate-[fadeIn_1s_ease-out]">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse"></span>
        <span>The Next Gen Transaction Gateway</span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[1.1] drop-shadow-2xl">
        <span className="text-white block sm:inline">Send Crypto</span>{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 block sm:inline mt-2 sm:mt-0">
          Without Limits.
        </span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-white max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 font-medium opacity-90">
        Experience the fastest and efficient way to distribute assets
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4 sm:px-0">
        <Link
          href="/dashboard"
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-base sm:text-lg font-bold transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
        >
          <FaRocket className="text-red-600 group-hover:rotate-12 transition-transform" />
          Launch App
        </Link>

        <a
          href="#product"
          className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-medium text-white border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
        >
          Explore Products
          <FaArrowRight className="group-hover:translate-x-1 transition-transform text-gray-400 group-hover:text-white" />
        </a>
      </div>
    </section>
  );
}
