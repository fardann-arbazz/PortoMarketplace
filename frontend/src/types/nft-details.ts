export interface NFTSDetails {
  tokenId: bigint;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
  listing?: {
    listingId: bigint;
    tokenId: bigint;
    nftContract: string;
    seller: string;
    price: bigint;
    status: number;
  };
  error?: any;
}
