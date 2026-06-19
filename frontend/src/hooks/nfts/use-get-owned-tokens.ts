import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useAccount, useReadContract } from "wagmi";

export function useOwnedTokens() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT.nft,
    abi: PortoNFT,
    functionName: "getOwnedTokens",
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  return {
    tokenIds: (data ?? []) as bigint[],
    isLoading,
    error,
  };
}
