import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { Listing } from "@/types/listing-type";
import { useEffect } from "react";
import { useReadContract } from "wagmi";

export function useGetListing(listingId: bigint) {
  const refreshKey = useMarketplaceStore((state) => state.refreshKey);

  const { data, refetch } = useReadContract({
    address: CONTRACT.marketplace,
    abi: PortoMarketplace,
    functionName: "getListing",
    args: [listingId],
    query: {
      enabled: !!listingId, 
    },
  });

  useEffect(() => {
    refetch();
  }, [refreshKey]);

  return {
    result: (data ?? {}) as Listing,
  };
}
