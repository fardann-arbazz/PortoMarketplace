import { PortoNFT } from "@/config/abi";
import { CONTRACT } from "@/config/address-contract";
import { fetchMetadata } from "@/service/metadata.service";
import { ipfsToHttp } from "@/service/pinata.service";
import { NFTMetadata } from "@/types/nft-metadata";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";

export function useNFTMetadata(tokenId: bigint) {
  const { data: tokenUri } = useReadContract({
    address: CONTRACT.nft,
    abi: PortoNFT,
    functionName: "tokenURI",
    args: [tokenId],
    query: {
      enabled: !!tokenId,
    },
  });

  const [metadata, setMetadata] = useState<NFTMetadata | undefined>();
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    if (!tokenUri) return;

    setMetadata(undefined); // penting untuk avoid stale UI

    fetchMetadata(String(tokenUri))
      .then((data) => {
        setMetadata({
          ...data,
          image: ipfsToHttp(data.image),
        });
      })
      .catch(setError);
  }, [tokenUri]);

  return { metadata, error };
}
