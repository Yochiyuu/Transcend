import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Font Montserrat yang kita setup di layout.tsx
        sans: ["var(--font-montserrat)"],
      },
      colors: {
        // Palet Warna dari Desain Figma Transcend
        background: "#121212", // Hitam Gelap Utama
        card: "#1E1E1E", // Hitam agak terang (untuk form)
        input: "#2A2A2A", // Abu gelap (untuk kolom input)
        primary: {
          DEFAULT: "#FF3B47", // Merah Terang (Brand Color)
          hover: "#E63540", // Merah agak gelap (saat mouse hover)
        },
        border: "#333333", // Garis tepi tipis
      },
      backgroundImage: {
        // Efek cahaya merah di bagian bawah layar
        "red-glow-bottom":
          "radial-gradient(circle at 50% 100%, rgba(255, 59, 71, 0.2) 0%, rgba(18, 18, 18, 0) 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
