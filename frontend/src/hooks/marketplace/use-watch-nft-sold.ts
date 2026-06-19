import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { useWatchContractEvent } from "wagmi";

export function useWatchNFTSold() {
  const triggerRefresh = useMarketplaceStore((state) => state.triggerRefresh);

  useWatchContractEvent({
    address: CONTRACT.marketplace,
    abi: PortoMarketplace,
    eventName: "NFTSold",

    onLogs(logs) {
      console.log("NFT Sold Event:", logs);

      triggerRefresh();
    },
  });
}
