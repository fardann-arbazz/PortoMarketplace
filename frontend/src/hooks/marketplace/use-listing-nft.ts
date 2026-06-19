import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useWriteContract } from "wagmi";

export function useListingNFT() {
  const { writeContract } = useWriteContract();

  const listingNFT = async (tokenId: bigint, price: bigint) => {
    return writeContract({
      address: CONTRACT.marketplace,
      abi: PortoMarketplace,
      functionName: "listNFT",
      args: [CONTRACT.nft, tokenId, price],
    });
  };

  return {
    listingNFT,
  };
}
