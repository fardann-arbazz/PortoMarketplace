import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useReadContract } from "wagmi";

export function useMarketplaceNFTs() {
  const { data: tokenIds } = useReadContract({
    address: CONTRACT.nft,
    abi: PortoNFT,
    functionName: "getOwnedTokens",
    args: [CONTRACT.marketplace],
  });

  return {
    tokenIds: tokenIds as bigint[] | undefined,
  };
}
