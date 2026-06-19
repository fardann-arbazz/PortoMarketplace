import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import NFTCard from "@/components/marketplace/nft-card";
import { useOwnedTokens } from "@/hooks/nfts/use-get-owned-tokens";
import { useNavigate } from "react-router-dom";

export default function MyNFTsPage() {
  const { address } = useAccount();
  const navigate = useNavigate();

  if (!address) {
    toast.error("Silahkan connect wallet terlebih dahulu");
    navigate("/");
    return;
  }

  const { tokenIds, isLoading, error } = useOwnedTokens();

  if (error) {
    toast.error("Error get token id");
    return;
  }

  console.log("tokenIds", tokenIds);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My NFTs</h1>
            <p className="text-sm text-muted-foreground">
              NFTs that you currently own and manage
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats / Info (opsional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Total Owned</p>
          <p className="text-2xl font-bold">{0}</p>
        </div>
        <div className="rounded-xl border bg-emerald-50/30 p-4">
          <p className="text-xs text-muted-foreground">Active Listings</p>
          <p className="text-2xl font-bold text-emerald-600">{0}</p>
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">Sold</p>
          <p className="text-2xl font-bold text-muted-foreground">{0}</p>
        </div>
      </div>

      {/* Tabs filter status */}
      <div className="mb-6">
        <Tabs>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* NFT Grid / Loading / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : tokenIds?.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokenIds?.map((tokenId) => (
            <NFTCard tokenId={tokenId} detailUrl={`/detail/token/${tokenId}`} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No NFTs found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {tokenIds?.length === 0
              ? "You don't own any NFTs yet. Mint or buy one to see it here!"
              : "No NFTs match the selected filter."}
          </p>
          {tokenIds?.length === 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => (window.location.href = "/marketplace")}
            >
              Browse Marketplace
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
