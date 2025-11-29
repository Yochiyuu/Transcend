// src/utils/config.ts
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { liskSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Project ID Reown kamu
const projectId = "532d7420a06eb045d949c0a77e189ed6";

// LOGIKA URL DINAMIS (PENTING: Biar tidak diblokir saat localhost)
const metadataUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://transcend-olive.vercel.app";

export const config = createConfig({
  chains: [liskSepolia],
  // 1. Wajib aktifkan SSR & Cookie Storage agar tidak error "indexedDB"
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  connectors: [
    // Opsi 1: Browser Extension (Laptop)
    injected(),

    // Opsi 2: WalletConnect (QR Code untuk HP)
    walletConnect({
      projectId,
      metadata: {
        name: "Transcend",
        description: "Transcend Enterprise DeFi Protocol",
        url: metadataUrl, // <--- Pakai URL dinamis ini
        icons: ["https://transcend-olive.vercel.app/logo.png"],
      },
      showQrModal: true, // Wajib true agar QR muncul
    }),
  ],
  transports: {
    [liskSepolia.id]: http(),
  },
});
