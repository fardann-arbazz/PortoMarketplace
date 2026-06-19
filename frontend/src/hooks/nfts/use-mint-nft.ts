import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseEventLogs } from "viem";
import { useConfig, useWriteContract } from "wagmi";

export function useMintNFT() {
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();

  const mintNFT = async (metadataUri: string) => {
    const hash = await writeContractAsync({
      address: CONTRACT.nft,
      abi: PortoNFT,
      functionName: "mint",
      args: [metadataUri],
    });

    const receipt = await waitForTransactionReceipt(config, {
      hash,
    });

    // baca nextTokenId terbaru
    const [mintEvent] = parseEventLogs({
      abi: PortoNFT,
      eventName: "Transfer",
      logs: receipt.logs,
    });

    if (!mintEvent) {
      throw new Error("Mint event not found");
    }

    return (mintEvent as any).args.tokenId;
  };

  return {
    mintNFT,
  };
}
