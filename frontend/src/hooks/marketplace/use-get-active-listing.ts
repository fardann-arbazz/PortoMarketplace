import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useMarketplaceStore } from "@/stores/marketplace-store";
import { Listing } from "@/types/listing-type";
import { useEffect } from "react";
import { useReadContract } from "wagmi";

export function useGetActiveListing() {
  const refreshKey = useMarketplaceStore((state) => state.refreshKey);

  const { data, refetch, isLoading, error, isError } = useReadContract({
    address: CONTRACT.marketplace,
    abi: PortoMarketplace,
    functionName: "getActiveListings",
  });

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  return {
    activeListing: (data ?? []) as Listing[],
    isLoading,
    error,
    isError,
  };
}
