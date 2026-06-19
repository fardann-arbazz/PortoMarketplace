import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  Hash,
  FileText,
  CheckCircle,
} from "lucide-react";
import { CONTRACT } from "@/config/address-contract";
import { formatEther } from "viem";
import { useBuyNFT } from "@/hooks/marketplace/use-buy-nft";
import { useETHPrice } from "@/hooks/use-eth-price";
import { toast } from "sonner";
import { useNFTDetails } from "@/hooks/nfts/use-nft-details";
import { useGetListing } from "@/hooks/marketplace/use-get-listing";
import { useNavigate, useParams } from "react-router-dom";

export default function NFTDetailPage() {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const navigate = useNavigate();

  const { type, id } = useParams();

  if (!type || !id) {
    return <div>Invalid URL</div>;
  }

  const idBigInt = BigInt(id);

  const { buyNFT } = useBuyNFT();

  const { result: listing } = useGetListing(idBigInt);

  const nft = useNFTDetails(idBigInt, listing);
  const { data: ethPriceUSD } = useETHPrice();

  if (!listing) {
    return <div>Loading...</div>;
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CONTRACT.nft);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  console.log("nft detail", nft);

  if (!nft?.listing || !nft?.metadata) {
    return <div>Loading...</div>;
  }

  const usdPrice = nft.listing?.price
    ? Number(formatEther(nft.listing.price)) * (ethPriceUSD ?? 0)
    : 0;

  const handleBuyNFT = async () => {
    if (!nft.listing) {
      return;
    }

    try {
      setIsBuying(true);

      await buyNFT(nft.listing.listingId, nft.listing.price);

      toast.success("NFT purchased successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to buy NFT");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="group mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Marketplace
      </button>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left Column — Image */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="overflow-hidden rounded-2xl border bg-muted aspect-square">
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column — Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Name */}
          <h1 className="text-3xl font-bold tracking-tight">
            {nft.metadata.name}
          </h1>

          {/* Price */}
          <div className="rounded-xl bg-muted/50 p-5 space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-sm text-muted-foreground">Price</span>
            </div>
            <div className="flex items-baseline gap-1">
              {nft.listing.price && (
                <span className="text-4xl font-bold tracking-tight">
                  {formatEther(nft.listing.price)}
                </span>
              )}
              <span className="text-xl font-semibold text-muted-foreground">
                ETH
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                ≈ ${" "}
                {usdPrice.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                USD
              </span>
            </div>

            {/* Buy Button */}
            <Button
              onClick={handleBuyNFT}
              disabled={isBuying || nft.listing.status !== 0}
              size="lg"
              className="w-full gap-2 text-base"
            >
              {isBuying ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  {nft.listing.status === 0
                    ? "Buy Now"
                    : nft.listing.status === 1
                      ? "Sold Out"
                      : "Pending..."}
                </>
              )}
            </Button>
            {nft.listing.status !== 0 && (
              <p className="text-center text-xs text-muted-foreground">
                This NFT is no longer available for purchase.
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {nft.metadata.description}
            </p>
          </div>

          <Separator />

          {/* Listing Details */}
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="seller">Seller Info</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Token ID
                    </span>
                    <span className="font-mono font-medium">{nft.tokenId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contract Address
                    </span>
                    <div className="flex items-center gap-1.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-xs cursor-pointer hover:text-primary transition-colors">
                              {nft.listing.nftContract.slice(0, 8)}...
                              {nft.listing.nftContract.slice(-4)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-mono text-xs">
                              {nft.listing.nftContract}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopyAddress}
                      >
                        {copiedAddress ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Listed
                    </span>
                    <span>
                      {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {nft.listing.seller && (
              <TabsContent value="seller" className="mt-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {nft.listing.seller.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        `${nft.listing.seller.slice(0, 10)}...$
                        {nft.listing.seller.slice(-6)}`
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {nft.listing.seller}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto gap-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
