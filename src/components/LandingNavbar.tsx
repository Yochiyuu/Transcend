import Image from "next/image";
import Link from "next/link";
// Import font Space Grotesk dari Google Fonts
import { Space_Grotesk } from "next/font/google";

// Konfigurasi font
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function LandingNavbar() {
  return (
    // Navbar dibuat fixed agar mengambang di atas konten saat di-scroll
    // Backdrop-blur memberikan efek kaca
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 md:px-12 border-b border-white/5 bg-black/10 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* --- LOGO SECTION --- */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center">
            {/* Glow effect di belakang logo */}
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700 scale-150"></div>
            <Image
              src="/logo.png"
              alt="Transcend Logo"
              width={40}
              height={40}
              className="object-contain h-9 w-auto relative z-10 transition-transform duration-500 group-hover:rotate-12"
              priority
            />
          </div>
          {/* Penerapan Font Baru */}
          <span
            className={`${spaceGrotesk.className} text-2xl font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors duration-300`}
          >
            Transcend
          </span>
        </Link>

        {/* --- CENTER MENU (Floating Pill) --- */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1.5 backdrop-blur-xl shadow-lg shadow-black/10">
          {["Product", "Token", "FAQ", "Statistic"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-5 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 relative group"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* --- CTA BUTTON --- */}
        <div>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden rounded-xl bg-white text-black font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            {/* Efek kilatan saat hover */}
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-200"></span>
            <span className="relative flex items-center gap-2">
              Launch dApp
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
