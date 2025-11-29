import { createConfig, http } from "wagmi";
import { liskSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = "532d7420a06eb045d949c0a77e189ed6";

export const config = createConfig({
  chains: [liskSepolia],
  connectors: [injected(), walletConnect({ projectId })],
  transports: {
    [liskSepolia.id]: http(),
  },
});
