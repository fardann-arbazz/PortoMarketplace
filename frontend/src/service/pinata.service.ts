import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_JWT_PINATA,
  pinataGateway: import.meta.env.VITE_GATEAWAY_PINATA,
});

export const uploadImage = async (file: File): Promise<string> => {
  const upload = await pinata.upload.public.file(file);

  return upload.cid;
};

export const uploadJSON = async (data: object): Promise<string> => {
  const upload = await pinata.upload.public.json(data);

  return upload.cid;
};

export const ipfsToHttp = (uri: string) => {
  if (!uri.startsWith("ipfs://")) {
    return uri;
  }

  const gateway = import.meta.env.VITE_GATEAWAY_PINATA;

  const normalizedGateway = gateway.startsWith("http")
    ? gateway
    : `https://${gateway}`;

  return `${normalizedGateway}/ipfs/${uri.replace("ipfs://", "")}`;
};
