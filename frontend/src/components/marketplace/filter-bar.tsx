import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { NFTStatus } from "@/data/dummy-nfts";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: NFTStatus | "all";
  onStatusChange: (value: NFTStatus | "all") => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  resultCount: number;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || statusFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, collection, or token ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as NFTStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-37.5">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price-asc">Price: Low → High</SelectItem>
            <SelectItem value="price-desc">Price: High → Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters & Count */}
      <div className="flex flex-wrap items-center gap-2">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 gap-1 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Button>
        )}
        {statusFilter !== "all" && (
          <Badge variant="secondary" className="gap-1 text-xs capitalize">
            {statusFilter}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() => onStatusChange("all")}
            />
          </Badge>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {resultCount} listing{resultCount !== 1 ? "s" : ""} found
        </span>
      </div>
    </div>
  );
}
