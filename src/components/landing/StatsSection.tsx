import { FaChartLine, FaRocket, FaServer, FaUsers } from "react-icons/fa6";

export default function StatsSection() {
  return (
    <section id="statistic" className="px-6 py-24 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 px-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Live Market Overview
            </h2>
            <p className="text-gray-400 mt-2">
              Real-time performance across the Transcend network.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium text-red-500">
              Live Updates
            </span>
          </div>
        </div>

        {/* MAIN CHART CONTAINER */}
        <div className="bg-[#0f0f11]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden relative">
          {/* Top Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-white/5">
            {[
              {
                label: "Total Volume",
                val: "$524.8M",
                change: "+12.5%",
                icon: <FaChartLine />,
              },
              {
                label: "Transactions",
                val: "2.4M",
                change: "+5.2%",
                icon: <FaRocket />,
              },
              {
                label: "Active Users",
                val: "150K+",
                change: "+8.1%",
                icon: <FaUsers />,
              },
              {
                label: "Network Uptime",
                val: "99.99%",
                change: "Stable",
                icon: <FaServer />,
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">
                  {item.icon} {item.label}
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">
                    {item.val}
                  </span>
                  <span
                    className={`text-xs font-medium mb-1 ${
                      item.change.includes("+")
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* THE BIG CHART (SVG) */}
          <div className="relative w-full h-[300px] sm:h-[400px] bg-gradient-to-b from-black/20 to-black/60">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 px-6 pointer-events-none opacity-20">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-full h-px bg-white/20 border-t border-dashed border-gray-600"
                ></div>
              ))}
            </div>

            {/* SVG Curve */}
            <svg
              className="w-full h-full absolute inset-0 z-10"
              preserveAspectRatio="none"
              viewBox="0 0 1200 400"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,350 C100,320 200,380 300,250 C400,120 500,200 600,150 C700,100 800,180 900,100 C1000,20 1100,80 1200,50 V400 H0 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,350 C100,320 200,380 300,250 C400,120 500,200 600,150 C700,100 800,180 900,100 C1000,20 1100,80 1200,50"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              />
              {[
                { cx: 300, cy: 250 },
                { cx: 600, cy: 150 },
                { cx: 900, cy: 100 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="6"
                  fill="#000"
                  stroke="#ef4444"
                  strokeWidth="3"
                  className="hover:r-8 transition-all cursor-pointer"
                />
              ))}
            </svg>

            {/* Tooltip Overlay */}
            <div className="absolute top-1/4 left-3/4 transform -translate-x-1/2 bg-black/80 border border-red-500/30 rounded-lg px-3 py-2 text-xs backdrop-blur-md shadow-xl z-20">
              <span className="text-gray-400 block">Peak Volume</span>
              <span className="text-white font-bold">$12.5M / hr</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
