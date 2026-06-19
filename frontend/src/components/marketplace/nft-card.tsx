import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNFTDetails } from "@/hooks/nfts/use-nft-details";
import { Listing } from "@/types/listing-type";
import { formatEther } from "viem";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router-dom";

interface NFTCardProps {
  tokenId: bigint;
  listing?: Listing;
  detailUrl: string;
}

export default function NFTCard({ tokenId, listing, detailUrl }: NFTCardProps) {
  const nft = useNFTDetails(tokenId, listing);
  const navigate = useNavigate();

  if (!nft) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card
      onClick={() => navigate(detailUrl)}
      className="group cursor-pointer pt-0 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={nft?.metadata?.image}
          alt={nft?.metadata?.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Price Tag */}
        {nft.listing?.price && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur px-3 py-1 text-sm font-semibold shadow">
              {formatEther(nft?.listing?.price)} ETH
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 pt-0 space-y-3 ">
        {/* Name & Collection */}
        <div>
          <h3 className="font-semibold text-sm truncate">
            {nft?.metadata?.name}
          </h3>
          <p className="text-slate-500 text-sm">{nft.metadata?.description}</p>
        </div>

        {/* Seller */}
        {nft.listing?.seller && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                        {nft.listing.seller.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate max-w-25">
                      {nft.listing.seller.slice(0, 6)}...$
                      {nft.listing.seller.slice(-4)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs font-mono">{nft?.listing?.seller}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
