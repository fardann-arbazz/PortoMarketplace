import { PortoMarketplace } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";

export function useBuyNFT() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const buyNFT = async (listingId: bigint, price: bigint) => {
    const hash = await writeContractAsync({
      address: CONTRACT.marketplace,
      abi: PortoMarketplace,
      functionName: "buyNFT",
      args: [listingId],
      value: price,
    });

    await waitForTransactionReceipt(config, {
      hash,
    });

    return hash;
  };

  return {
    buyNFT,
  };
}
