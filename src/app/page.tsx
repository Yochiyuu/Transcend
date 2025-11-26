import LandingNavbar from "@/components/LandingNavbar";
import Link from "next/link";
import Image from "next/image"; // 1. Import komponen Image
import { SiBitcoin, SiEthereum, SiSolana, SiTether } from "react-icons/si";

export default function LandingPage() {
  return (
    <main className="h-screen w-full bg-[#121212] bg-red-glow-bottom text-white font-sans relative overflow-hidden font-montserrat flex flex-col">
      {/* Background Circle Effect */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2
                      bg-black rounded-[100%]
                      border-t border-white/10 shadow-[0_-10px_100px_rgba(0,0,0,1)]
                      w-[250vw] h-[250vw] bottom-[-235vw]
                      md:w-[180vw] md:h-[180vw] md:bottom-[-168vw]
                      lg:w-[140vw] lg:h-[140vw] lg:bottom-[-130vw]"
      ></div>

      <div className="relative z-20 h-full flex flex-col justify-between pointer-events-none">
        <div className="pointer-events-auto w-full">
          <LandingNavbar />
        </div>

        <div className="flex-1 container mx-auto px-4 flex items-center relative mb-10 lg:mb-0">
          <div className="grid lg:grid-cols-2 gap-8 items-center w-full h-full relative">
            
            {/* Left Content & Icons */}
            <div className="space-y-6 flex flex-col justify-center pointer-events-auto pl-4 lg:pl-0 relative group">
              
              {/* --- 2. Perbaikan Posisi Icon Mobile --- */}
              <div className="absolute inset-0 pointer-events-none z-0">
                {/* Ethereum: Kiri Atas */}
                <div className="absolute -top-10 -left-2 lg:-top-30 lg:-left-20 w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-primary border border-red-400/50 flex items-center justify-center animate-pulse shadow shadow-[0_0_30px_rgba(255,59,71,0.6)]">
                  <SiEthereum className="text-2xl lg:text-4xl text-white" />
                </div>
                
                {/* Bitcoin: Kanan Atas */}
                <div className="absolute -top-8 right-4 lg:-top-12 lg:right-2 w-14 h-14 lg:w-23 lg:h-23 rounded-full bg-primary border border-red-400/50 flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(255,59,71,0.5)]">
                  <SiBitcoin className="text-xl lg:text-2xl text-white" />
                </div>
                
                {/* Tether: Kiri Bawah */}
                <div className="absolute -bottom-16 left-0 lg:-bottom-34 lg:left-4 w-14 h-14 lg:w-22 lg:h-22 rounded-full bg-primary border border-red-400/50 flex items-center justify-center animate-pulse shadow delay-300 shadow-[0_0_25px_rgba(255,59,71,0.5)]">
                  <SiTether className="text-xl lg:text-3xl text-white" />
                </div>
                
                {/* Solana: Kanan Bawah */}
                <div className="absolute -bottom-8 right-8 lg:-bottom-10 lg:right-20 lg:right-40 w-14 h-14 lg:w-22 lg:h-22 rounded-full bg-primary border border-red-400/50 flex items-center justify-center animate-pulse delay-500 shadow-[0_0_20px_rgba(255,59,71,0.4)]">
                  <SiSolana className="text-xl lg:text-2xl text-white" />
                </div>
              </div>
              {/* ------------------------------------- */}

              <div className="relative z-10 mb-10">
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
                  Send{" "}
                  <span className="text-primary drop-shadow-[0_0_25px_rgba(255,59,71,0.6)]">
                    Crypto
                  </span>{" "}
                  to <br />
                  Hundreds{" "}
                  <span className="text-primary drop-shadow-[0_0_25px_rgba(255,59,71,0.6)]">
                    Instantly.
                  </span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl leading-relaxed mt-6">
                  Transcend lets you distribute crypto assets to multiple wallet
                  addresses in one click fast, secure, and effortless.
                </p>
                <div className="pt-8 relative">
                  <Link
                    href="/dashboard"
                    className="inline-block bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg text-lg font-bold transition shadow-[0_0_20px_rgba(255,59,71,0.4)] hover:shadow-[0_0_40px_rgba(255,59,71,0.7)] hover:-translate-y-1 relative z-20"
                  >
                    Launch dApp Now
                  </Link>
                </div>
              </div>
            </div>

            {/* --- 3. Bagian Ilustrasi Image --- */}
            <div className="hidden lg:flex justify-end items-end h-full pb-16 xl:pb-24">
              <div className="relative w-[380px] h-[450px] xl:w-[420px] xl:h-[500px] bg-gradient-to-b from-white/5 to-transparent rounded-t-[50px] border-x-2 border-t-2 border-white/10 flex items-end justify-center overflow-hidden backdrop-blur-sm pointer-events-auto">
                
                {/* Ganti src dengan path gambarmu */}
                <div className="absolute inset-0 z-10 flex items-end justify-center">
                   {/* Pastikan file ada di folder public/images/hero.png */}
                   <Image 
                      src="/images/hero.png" 
                      alt="Transcend App Illustration"
                      width={400}
                      height={500}
                      className="object-cover object-bottom opacity-90 drop-shadow-[0_0_50px_rgba(255,59,71,0.3)]"
                      priority
                   />
                </div>

                {/* Optional: Glow Effect di belakang gambar */}
                <div className="absolute bottom-0 w-3/4 h-1/2 bg-primary/20 blur-[80px] rounded-full z-0"></div>
              </div>
            </div>
            {/* ------------------------------- */}

          </div>
        </div>

        {/* Footer Stats */}
        <div className="pb-12 pointer-events-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 max-w-4xl mx-auto text-center divide-x divide-white/10">
              <div>
                <h3 className="text-3xl lg:text-5xl font-bold text-primary mb-1 drop-shadow-[0_0_10px_rgba(255,59,71,0.4)]">
                  2.5k+
                </h3>
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">
                  Partner
                </p>
              </div>
              <div>
                <h3 className="text-3xl lg:text-5xl font-bold text-primary mb-1 drop-shadow-[0_0_10px_rgba(255,59,71,0.4)]">
                  500k+
                </h3>
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">
                  Active User
                </p>
              </div>
              <div>
                <h3 className="text-3xl lg:text-5xl font-bold text-primary mb-1 drop-shadow-[0_0_10px_rgba(255,59,71,0.4)]">
                  2m+
                </h3>
                <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">
                  User Happy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}