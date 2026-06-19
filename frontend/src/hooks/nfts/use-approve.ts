import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { useWriteContract } from "wagmi";

export function useApprovedNFT() {
  const { writeContractAsync } = useWriteContract();

  const approveNFT = async (tokenId: bigint) => {
    return writeContractAsync({
      address: CONTRACT.nft,
      abi: PortoNFT,
      functionName: "approve",
      args: [CONTRACT.marketplace, tokenId],
    });
  };

  return {
    approveNFT,
  };
}
