// src/utils/config.ts
import { http, createConfig } from 'wagmi'
import { liskSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [liskSepolia],
  connectors: [injected()],
  transports: {
    [liskSepolia.id]: http(),
  },
})