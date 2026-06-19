import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingBag,
  PlusCircle,
  Wallet,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
  currentPage: string;
}

export default function Header({ currentPage }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const { connectors, connect, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const location = useLocation();

  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address ?? "");
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getVariant = (path: string) => {
    return location.pathname === path ? "default" : "ghost";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate("/")}
        >
          <span className="text-lg font-bold tracking-tight">NFT Bazaar</span>
          <Badge variant="secondary" className="ml-1 text-[10px]">
            BETA
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button
            variant={getVariant("/")}
            size="sm"
            onClick={() => navigate("/")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Marketplace
          </Button>
          <Button
            variant={getVariant("/my-nfts")}
            size="sm"
            onClick={() => navigate("/my-nfts")}
          >
            <Wallet className="mr-2 h-4 w-4" />
            My NFTs
          </Button>
          <Button
            variant={getVariant("/my-listings")}
            size="sm"
            onClick={() => navigate("/my-listings")}
          >
            <Wallet className="mr-2 h-4 w-4" />
            My Listing
          </Button>
          <Button
            variant={getVariant("/create")}
            size="sm"
            onClick={() => navigate("/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </nav>

        {/* Mobile Nav (compact) */}
        <nav className="flex items-center gap-1 md:hidden">
          <Button size="icon" onClick={() => navigate("/")}>
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button
            variant={currentPage === "my-nfts" ? "default" : "ghost"}
            size="icon"
            onClick={() => navigate("/my-nfts")}
          >
            <Wallet className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={() => navigate("/create")}>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </nav>

        {/* Wallet Section */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span className="hidden sm:inline">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/20 text-xs text-primary">
                      {address?.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <span className="text-sm font-medium">
                    {address?.slice(0, 8)}...{address?.slice(-6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <span className="text-[10px] text-emerald-500">✓</span>
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full p-0 text-left hover:bg-transparent! hover:text-inherit! hover:scale-100! active:scale-100! focus-visible:ring-0 focus-visible:ring-offset-0 transition-none"
                    onClick={() => disconnect()}
                  >
                    Disconnect Wallet
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setIsWalletDialogOpen(true)}
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
              </Button>

              {/* Dialog Pilihan Wallet */}
              <Dialog
                open={isWalletDialogOpen}
                onOpenChange={setIsWalletDialogOpen}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center">
                      Connect a Wallet
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 py-4">
                    {connectors.map((connector) => (
                      <Button
                        key={connector.id}
                        variant="outline"
                        onClick={() => connect({ connector })}
                        size="lg"
                        className="h-auto flex-col gap-2 py-6 hover:bg-accent! hover:text-accent-foreground! transition-all"
                      >
                        {connector.icon ? (
                          <img
                            src={connector.icon}
                            alt={connector.name}
                            className="h-8 w-8"
                          />
                        ) : null}

                        <span className="text-sm font-medium">
                          {connector.name}
                        </span>
                        {isPending && connector.id === "injected" && (
                          <span className="text-xs text-muted-foreground">
                            Connecting...
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    By connecting, you agree to our Terms of Service
                  </p>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
