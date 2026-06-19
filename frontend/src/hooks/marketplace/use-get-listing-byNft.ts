import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { Listing } from "@/types/listing-type";
import { useReadContract } from "wagmi";

export function useGetListingByNft(tokenId: bigint) {
  const { data, isLoading, error, isError } = useReadContract({
    address: CONTRACT.marketplace,
    abi: PortoMarketplace,
    functionName: "getListingByNFT",
    args: [CONTRACT.nft, tokenId],
    query: {
      enabled: !!tokenId,
    },
  });

  if (!data) return;

  return {
    listingDataType: data as Listing | undefined,
    isLoading,
    error,
    isError,
  };
}
