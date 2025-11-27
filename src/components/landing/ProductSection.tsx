import { FaCheck } from "react-icons/fa6";

export default function ProductSection() {
  return (
    <section id="product" className="py-24 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          Choose Your Path
        </h2>
        <p className="text-gray-300 text-lg">
          Scalable solutions for individuals and global enterprises.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="flex flex-col relative group bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-300 h-full">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">Community</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Perfect for individuals & developers
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold">Free</span>
            <span className="text-gray-500"> / forever</span>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {[
              "Basic Send/Receive",
              "Public API Access",
              "Standard Transaction Speed",
              "Community Support",
              "Single Wallet Support",
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                  <FaCheck />
                </div>
                {feat}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white hover:text-black font-semibold transition-all mt-auto">
            Get Started
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="flex flex-col relative group bg-gradient-to-b from-red-900/10 to-black/40 backdrop-blur-md border border-red-500/50 rounded-3xl p-8 hover:shadow-[0_0_50px_rgba(220,38,38,0.2)] transition-all duration-300 h-full">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">
            MOST POPULAR
          </div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-red-400">Enterprise</h3>
            <p className="text-gray-400 mt-2 text-sm">
              For high-volume businesses
            </p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold">Custom</span>
            <span className="text-gray-500"> / volume based</span>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {[
              "Unlimited Transactions",
              "Dedicated Account Manager",
              "Priority Network Speed (Gasless)",
              "Multi-Sig Security Vault",
              "White-label Integration",
              "24/7 Priority Support",
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-xs">
                  <FaCheck />
                </div>
                {feat}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-900/50 mt-auto">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
