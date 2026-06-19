import { ipfsToHttp, uploadImage, uploadJSON } from "./pinata.service";

export const uploadNFTMetadata = async (
  name: string,
  description: string,
  image: File,
) => {
  const imageCid = await uploadImage(image);

  const metadata = {
    name: name,
    description: description,
    image: `ipfs://${imageCid}`,
  };

  const metadataCid = await uploadJSON(metadata);

  return {
    imageCid,
    metadataCid,
    metadataUri: `ipfs://${metadataCid}`,
  };
};

export const fetchMetadata = async (tokenURI: string) => {
  const url = ipfsToHttp(tokenURI);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed fetch metadata");
  }

  return response.json();
};
