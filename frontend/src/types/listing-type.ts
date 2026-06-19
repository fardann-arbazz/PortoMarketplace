export type Listing = {
  listingId: bigint;
  nftContract: `0x${string}`;
  seller: `0x${string}`;
  tokenId: bigint;
  price: bigint;
  status: number;
};
