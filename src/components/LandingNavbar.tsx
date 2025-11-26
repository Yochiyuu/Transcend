import Image from "next/image";
import Link from "next/link";

export default function LandingNavbar() {
  return (
    <nav
      className="w-full flex items-center justify-between py-6 px-8 relative z-50 
                    bg-[#591519]/85 backdrop-blur-md border-b border-red-500/20"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo Gambar */}
          <Image
            src="/logo.png"
            alt="Transcend Logo"
            width={40}
            height={40}
            className="object-contain h-10 w-auto" // Tinggi disamakan dengan teks
            priority
          />
          {/* Teks Transcend */}
          <span className="text-xl font-bold tracking-wide text-white italic">
            Transcend
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex gap-10 text-sm font-medium">
          <a
            href="#"
            className="text-white hover:text-primary transition hover:drop-shadow-[0_0_8px_rgba(255,59,71,0.5)]"
          >
            Product
          </a>
          <a
            href="#"
            className="text-white hover:text-primary transition hover:drop-shadow-[0_0_8px_rgba(255,59,71,0.5)]"
          >
            Token
          </a>
          <a
            href="#"
            className="text-white hover:text-primary transition hover:drop-shadow-[0_0_8px_rgba(255,59,71,0.5)]"
          >
            FAQ
          </a>
          <a
            href="#"
            className="text-white hover:text-primary transition hover:drop-shadow-[0_0_8px_rgba(255,59,71,0.5)]"
          >
            Statistic
          </a>
        </div>

        {/* Button */}
        <div>
          <Link
            href="/dashboard"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg text-sm font-bold transition shadow-[0_0_20px_rgba(255,59,71,0.4)] hover:shadow-[0_0_30px_rgba(255,59,71,0.6)]"
          >
            Launch dApp
          </Link>
        </div>
      </div>
    </nav>
  );
}
