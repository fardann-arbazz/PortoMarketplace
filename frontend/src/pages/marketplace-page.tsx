import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";
import { NFTStatus } from "../data/dummy-nfts";

import { useGetActiveListing } from "@/hooks/marketplace/use-get-active-listing";
import NFTCard from "@/components/marketplace/nft-card";
import { toast } from "sonner";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<NFTStatus | "all">("active");

  const { activeListing, error, isLoading } = useGetActiveListing();

  if (error) {
    return toast.error("Gagal mendapatkan data active listing");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              NFT Marketplace
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse and discover unique NFTs from various collections
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tabs */}
      <div className="mb-6">
        <Tabs
          defaultValue="active"
          value={statusFilter === "all" ? "all" : statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v === "all" ? "all" : (v as NFTStatus))
          }
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active Listings</TabsTrigger>
            <TabsTrigger value="sold">Sold</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter Bar */}
      {/* <div className="mb-6">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div> */}

      {/* NFT Grid / Loading / Empty */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : activeListing.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeListing.map((listing) => (
            <NFTCard
              tokenId={listing.tokenId}
              listing={listing}
              detailUrl={`/detail/listing/${listing.listingId}`}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No NFTs found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters to find what you're looking for."
              : "There are no listings available at the moment. Check back later!"}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
