export type NFTStatus = "active" | "sold" | "pending";

export interface NFTItem {
  id: string;
  tokenId: string;
  contractAddress: string;
  name: string;
  collection: string;
  image: string; // placeholder gradient
  price: number; // dalam ETH
  seller: string;
  sellerEns?: string;
  status: NFTStatus;
  listedAt: string;
  description: string;
}

export const dummyNFTs: NFTItem[] = [
  {
    id: "1",
    tokenId: "4201",
    contractAddress: "0x7a...3b9f",
    name: "Pixel Ape #4201",
    collection: "Pixel Apes",
    image: "https://picsum.photos/seed/nft1/400/400",
    price: 0.85,
    seller: "0x1a2b...9c8d",
    sellerEns: "crypto-alice.eth",
    status: "active",
    listedAt: "2026-06-01T10:30:00Z",
    description: "A rare Pixel Ape with golden fur and laser eyes.",
  },
  {
    id: "2",
    tokenId: "1307",
    contractAddress: "0x4f...d2e1",
    name: "Cyber Cat #1307",
    collection: "Cyber Cats",
    image: "https://picsum.photos/seed/nft2/400/400",
    price: 1.2,
    seller: "0x5e6f...7a8b",
    sellerEns: "bob-nft.eth",
    status: "active",
    listedAt: "2026-06-02T14:15:00Z",
    description: "A neon-infused cyber cat from the year 2099.",
  },
  {
    id: "3",
    tokenId: "5592",
    contractAddress: "0x2c...a1b4",
    name: "Doodle World #5592",
    collection: "Doodle World",
    image: "https://picsum.photos/seed/nft3/400/400",
    price: 0.45,
    seller: "0x9d0e...f3c2",
    sellerEns: undefined,
    status: "active",
    listedAt: "2026-06-03T08:00:00Z",
    description:
      "A colorful doodle-style character from the Doodle World universe.",
  },
  {
    id: "4",
    tokenId: "8812",
    contractAddress: "0x7a...3b9f",
    name: "Pixel Ape #8812",
    collection: "Pixel Apes",
    image: "https://picsum.photos/seed/nft4/400/400",
    price: 2.1,
    seller: "0x1a2b...9c8d",
    sellerEns: "crypto-alice.eth",
    status: "sold",
    listedAt: "2026-05-28T16:45:00Z",
    description: "A sold Pixel Ape — original mint.",
  },
  {
    id: "5",
    tokenId: "3341",
    contractAddress: "0x8b...f7a2",
    name: "Meta Lion #3341",
    collection: "Meta Lions",
    image: "https://picsum.photos/seed/nft5/400/400",
    price: 3.5,
    seller: "0x4b3c...d2e1",
    sellerEns: "lion-king.eth",
    status: "active",
    listedAt: "2026-06-04T11:20:00Z",
    description: "The king of the metaverse jungle.",
  },
  {
    id: "6",
    tokenId: "7719",
    contractAddress: "0x2c...a1b4",
    name: "Doodle World #7719",
    collection: "Doodle World",
    image: "https://picsum.photos/seed/nft6/400/400",
    price: 0.65,
    seller: "0x7f8a...e3b9",
    sellerEns: undefined,
    status: "active",
    listedAt: "2026-06-05T09:10:00Z",
    description: "An ultra-rare Doodle with a rainbow background.",
  },
  {
    id: "7",
    tokenId: "2098",
    contractAddress: "0x4f...d2e1",
    name: "Cyber Cat #2098",
    collection: "Cyber Cats",
    image: "https://picsum.photos/seed/nft7/400/400",
    price: 0.95,
    seller: "0x5e6f...7a8b",
    sellerEns: "bob-nft.eth",
    status: "active",
    listedAt: "2026-06-05T18:30:00Z",
    description: "A stealth-mode cyber cat with cloaking abilities.",
  },
  {
    id: "8",
    tokenId: "4120",
    contractAddress: "0x8b...f7a2",
    name: "Meta Lion #4120",
    collection: "Meta Lions",
    image: "https://picsum.photos/seed/nft8/400/400",
    price: 4.0,
    seller: "0x4b3c...d2e1",
    sellerEns: "lion-king.eth",
    status: "pending",
    listedAt: "2026-06-06T02:00:00Z",
    description: "A majestic lion awaiting final confirmation.",
  },
];

export const mockConnectedAddress =
  "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9c8d";
