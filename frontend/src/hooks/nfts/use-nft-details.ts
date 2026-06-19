import { Listing } from "@/types/listing-type";
import { useNFTMetadata } from "./use-nft-metadata";
import { NFTSDetails } from "@/types/nft-details";

export function useNFTDetails(
  tokenId: bigint,
  listing?: Listing,
): NFTSDetails | undefined {
  const { metadata, error } = useNFTMetadata(tokenId);

  if (!metadata) {
    return;
  }

  return {
    tokenId,
    metadata,
    listing,
    error,
  };
}
