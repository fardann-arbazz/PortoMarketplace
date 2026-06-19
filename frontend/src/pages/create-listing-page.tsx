import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  ImageIcon,
  Info,
  UploadCloud,
  X,
  Coins,
  ListOrdered,
} from "lucide-react";
import StepIndicator from "@/components/listing/step-indicator";
import { uploadNFTMetadata } from "@/service/metadata.service";

import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useApprovedNFT } from "@/hooks/nfts/use-approve";
import { parseEther } from "viem";
import { CONTRACT } from "@/config/address-contract";
import { useMintNFT } from "@/hooks/nfts/use-mint-nft";
import { useListingNFT } from "@/hooks/marketplace/use-listing-nft";

interface MintedNFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { address } = useAccount();

  // Form state
  const [nftName, setNftName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mintedNFT, setMintedNFT] = useState<MintedNFT | null>(null);
  const [price, setPrice] = useState("");

  // Validasi: name + image wajib
  const isMintFormValid = nftName.trim().length > 0 && imageFile !== null;
  const isListFormValid = price.trim().length > 0 && Number(price) > 0;

  // NFT hooks
  const { mintNFT } = useMintNFT();
  const { approveNFT } = useApprovedNFT();
  const { listingNFT } = useListingNFT();

  const steps = [
    { label: "Mint NFT", description: "Create your NFT" },
    { label: "Approve", description: "Allow transfer" },
    { label: "List for Sale", description: "Set price" },
  ];

  // ====== MINT ======
  const handleMint = async () => {
    if (!address) {
      toast.error("Silahkan connect wallet terlebih dahulu");
      return;
    }

    if (!imageFile) return;
    setIsProcessing(true);
    try {
      const { metadataUri } = await uploadNFTMetadata(
        nftName,
        description,
        imageFile,
      );

      const tokenId = await mintNFT(metadataUri);
      console.log("tokenId from handleMint:", tokenId);

      setMintedNFT({
        tokenId: tokenId.toString(),
        contractAddress: CONTRACT.nft,
        name: nftName,
        description,
        imageUrl: imagePreviewUrl,
      });

      toast.success("Mint berhasil dilakukan!");
      setCurrentStep(1);
    } catch (error) {
      console.error("Mint error:", error);
      toast.error("Terjadi kesalahan ketika mint");
    } finally {
      setIsProcessing(false);
    }
  };

  // ====== APPROVE ======
  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const tokenId = mintedNFT?.tokenId;
      console.log("tokenId from handle approve", tokenId);

      if (!tokenId) {
        toast.error("TokenId tidak ditemukan");
        return;
      }

      const tx = await approveNFT(BigInt(tokenId));
      console.log(tx);

      toast.success("Approve berhasil dilakukan!");
      setCurrentStep(2);
    } catch (error) {
      console.log("Error", error);
      toast.error("Terjadi kesalahan ketika approve");
    } finally {
      setIsProcessing(false);
    }
  };

  // ====== LIST ======
  const handleList = async () => {
    setIsProcessing(true);
    try {
      const tokenId = mintedNFT?.tokenId;
      console.log("tokenId from handleLIst:", tokenId);

      if (!tokenId) {
        toast.error("TokenId tidak ditemukan");
        return;
      }

      const priceWei = parseEther(price);

      const tx = await listingNFT(BigInt(tokenId), priceWei);
      console.log(tx);

      toast.success("Berhasil melakukan listing");
      setCurrentStep(3);
    } catch (error) {
      console.log("error", error);
      toast.error("Terjadi kesalahan ketika listing NFT");
    } finally {
      setIsProcessing(false);
    }
  };

  // ====== IMAGE HANDLERS ======
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setNftName("");
    setDescription("");
    setImageFile(null);
    setImagePreviewUrl("");
    setMintedNFT(null);
    setPrice("");
    setIsComplete(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create Listing
            </h1>
            <p className="text-sm text-muted-foreground">
              Mint, approve, and list your NFT for sale
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={steps}
          currentStep={isComplete ? 3 : currentStep}
        />
      </div>

      {/* Success State */}
      {isComplete ? (
        <Card className="border-emerald-500/30 bg-emerald-50/50">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold">Listing Created Successfully!</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your NFT <strong>{mintedNFT?.name}</strong> is now listed for{" "}
              {price} ETH.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={handleReset}>
                List Another NFT
              </Button>
              <Button onClick={() => window.location.reload()}>
                View on Marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 0 && "Mint Your NFT"}
              {currentStep === 1 && "Approve Transfer"}
              {currentStep === 2 && "Set Price & List"}
            </CardTitle>
            <CardDescription>
              {currentStep === 0 &&
                "Enter the metadata for your new NFT and mint it on-chain."}
              {currentStep === 1 &&
                "Approve the marketplace to handle your NFT."}
              {currentStep === 2 && "Set your listing price and confirm."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ========== STEP 0: MINT ========== */}
            {currentStep === 0 && (
              <div className="space-y-5">
                {/* NFT Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="nftName"
                    className="after:content-['_*'] after:text-destructive"
                  >
                    NFT Name
                  </Label>
                  <Input
                    id="nftName"
                    placeholder="e.g. CryptoKitty #42"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell a story about your NFT..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* ---------- UPLOAD IMAGE (REQUIRED) ---------- */}
                <div className="space-y-2">
                  <Label className="after:content-['_*'] after:text-destructive">
                    NFT Image
                  </Label>

                  {!imagePreviewUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                        ${
                          imageFile === null && !isProcessing
                            ? "border-muted-foreground/25 hover:border-primary/50"
                            : "border-primary/50"
                        }`}
                    >
                      <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground/60" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        PNG, JPG, GIF up to 10MB
                      </p>
                      {imageFile === null && !isProcessing && (
                        <p className="mt-2 text-xs text-destructive/80">
                          * Image is required
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="h-40 w-40 object-cover rounded-xl border"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {/* Pesan error jika belum upload */}
                  {imageFile === null && (
                    <p className="text-xs text-muted-foreground">
                      <span className="text-destructive">*</span> You must
                      upload an image for your NFT.
                    </p>
                  )}
                </div>

                {/* Mini preview saat ada data */}
                {(nftName || imagePreviewUrl) && (
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Preview
                    </p>
                    <div className="flex gap-4 items-start">
                      <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden shrink-0">
                        {imagePreviewUrl ? (
                          <img
                            src={imagePreviewUrl}
                            alt="NFT"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/20 to-secondary/20">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {nftName && (
                          <p className="font-semibold text-sm">{nftName}</p>
                        )}
                        {description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {description}
                          </p>
                        )}
                        <Badge variant="secondary" className="gap-1 mt-1">
                          <Coins className="h-3 w-3" />
                          Ready to mint
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={!isMintFormValid || isProcessing}
                  onClick={handleMint}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    "Mint NFT"
                  )}
                </Button>
              </div>
            )}

            {/* ========== STEP 1: APPROVE ========== */}
            {currentStep === 1 && mintedNFT && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You need to approve the marketplace to transfer your NFT.
                    This is a one-time gas transaction.
                  </AlertDescription>
                </Alert>

                <div className="rounded-xl border p-4 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img
                        src={mintedNFT.imageUrl}
                        alt={mintedNFT.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{mintedNFT.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Token #{mintedNFT.tokenId}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {mintedNFT.contractAddress}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 ml-auto" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        Approve Transfer
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ========== STEP 2: LIST ========== */}
            {currentStep === 2 && mintedNFT && (
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-50/30 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-700">
                      Approved!
                    </span>
                  </div>
                  <Separator />
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img
                        src={mintedNFT.imageUrl}
                        alt={mintedNFT.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{mintedNFT.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Token #{mintedNFT.tokenId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETH) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {price && Number(price) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ ${(Number(price) * 3200).toLocaleString()} USD
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={handleList}
                    disabled={!isListFormValid || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Listing...
                      </>
                    ) : (
                      <>
                        <ListOrdered className="h-4 w-4" />
                        Confirm Listing
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
