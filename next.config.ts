import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Mengabaikan modul-modul yang sering bikin error di library walletconnect/wagmi
    config.externals.push("pino-pretty", "lokijs", "encoding", "tap");
    return config;
  },
};

export default nextConfig;
