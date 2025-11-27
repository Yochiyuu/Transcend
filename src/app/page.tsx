"use client";

import Aurora from "@/components/Aurora";
import LandingNavbar from "@/components/LandingNavbar";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ProductSection from "@/components/landing/ProductSection";
import StatsSection from "@/components/landing/StatsSection";
import TokenSection from "@/components/landing/TokenSection";
import { useEffect } from "react";

// Pastikan ada 'export default function' ini!
export default function LandingPage() {
  // Smooth Scroll Effect
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="relative min-h-screen w-full text-white font-sans flex flex-col overflow-x-hidden">
      {/* --- BACKGROUND LAYERS --- */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          speed={0.5}
          amplitude={1.0}
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
      </div>

      {/* --- CONTENT WRAPPER --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavbar />

        <HeroSection />
        <ProductSection />
        <TokenSection />
        <FaqSection />
        <StatsSection />

        <Footer />
      </div>
    </main>
  );
}
