import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { Listing } from "@/types/listing-type";
import { useAccount, useReadContract } from "wagmi";

export function useGetSellerListing() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT.marketplace,
    abi: PortoMarketplace,
    functionName: "getSellerListings",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  return {
    listingSeller: (data ?? []) as Listing[],
    isLoading,
    error,
  };
}
