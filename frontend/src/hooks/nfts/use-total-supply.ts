import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useReadContract } from "wagmi";

export const useTotalSupply = () => {
  return useReadContract({
    address: CONTRACT.nft,
    abi: PortoNFT,
    functionName: "totalSupply",
  });
};
