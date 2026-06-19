import { createConfig, http } from "wagmi";
import { anvil, mainnet, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [anvil, mainnet, sepolia],
  transports: {
    [anvil.id]: http("http://127.0.0.1:8545"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
