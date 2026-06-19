// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract PortoMarketplace is IERC721Receiver, Ownable, ReentrancyGuard {
    enum Status {
        Active,
        Sold,
        Cancelled
    }

    struct Listing {
        uint256 listingId;
        address nftContract;
        address seller;
        uint64 tokenId;
        uint96 price;
        Status status;
    }

    uint256 public nextListingId = 1;

    mapping(uint256 => Listing) public listings;

    // nftContract => tokenId => listingId
    mapping(address => mapping(uint256 => uint256)) public activeListing;

    uint256 public constant FEE_PERCENTAGE = 250; //2.5% fee
    uint256 public accruedFees;

    error InvalidAddress();
    error PriceMustBeAboveZero();
    error NotNFTOwner();
    error NotSeller();
    error TransferFailed();
    error NotApprovedForMarketplace();
    error ListingNotActive();
    error InsufficientPayment();
    error AlreadyListed();
    error CannotBuyOwnListing();
    error ListingNotExist();
    error WithdrawFailed();

    event NFTListed(
        uint256 indexed listingId, address indexed nftContract, uint64 indexed tokenId, address seller, uint96 price
    );
    event NFTSold(uint256 indexed listingId, address indexed buyer, uint96 price, address nftContract, uint256 tokenId);
    event ListingCancelled(uint256 indexed listingId);
    event ListingPriceUpdated(uint256 indexed listingId, uint96 newPrice);

    constructor() Ownable(msg.sender) {}

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function getListing(uint256 listing) external view returns (Listing memory) {
        return listings[listing];
    }

    function getListingByNFT(address nftContract, uint256 tokenId) external view returns (Listing memory) {
        uint256 listingId = activeListing[nftContract][tokenId];
        if (listingId == 0) revert ListingNotExist();

        return listings[listingId];
    }

    function listNFT(address nftContract, uint64 tokenId, uint96 price) external {
        if (nftContract == address(0)) revert InvalidAddress();
        if (price == 0) revert PriceMustBeAboveZero();
        if (activeListing[nftContract][tokenId] != 0) revert AlreadyListed();

        IERC721 nft = IERC721(nftContract);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotNFTOwner();

        bool approved = nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this));
        if (!approved) revert NotApprovedForMarketplace();

        nft.safeTransferFrom(msg.sender, address(this), tokenId, "");

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
           listingId: listingId, nftContract: nftContract, seller: msg.sender, tokenId: tokenId, price: price, status: Status.Active
        });

        activeListing[nftContract][tokenId] = listingId;
        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotExist();
        if (listing.status != Status.Active) revert ListingNotActive();
        if (msg.sender == listing.seller) revert CannotBuyOwnListing();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.status = Status.Sold;

        uint256 excess = msg.value - listing.price;
        if (excess > 0) {
            (bool refundSent,) = payable(msg.sender).call{value: excess}("");
            if (!refundSent) revert TransferFailed();
        }

        uint256 fee = (listing.price * FEE_PERCENTAGE) / 10000;
        uint256 sellerAmount = listing.price - fee;

        accruedFees += fee;

        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId, "");

        (bool sent,) = payable(listing.seller).call{value: sellerAmount}("");
        if (!sent) revert TransferFailed();

        activeListing[listing.nftContract][listing.tokenId] = 0;
        emit NFTSold(listingId, msg.sender, listing.price, listing.nftContract, listing.tokenId);
    }

    function updateListingPrice(uint256 listingId, uint96 newPrice) external {
        Listing storage listing = listings[listingId];

        if (listing.seller == address(0)) revert ListingNotExist();
        if (listing.seller != msg.sender) revert NotSeller();
        if (listing.status != Status.Active) revert ListingNotActive();
        if (newPrice == 0) revert PriceMustBeAboveZero();

        listing.price = newPrice;
        emit ListingPriceUpdated(listingId, newPrice);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        if (listing.seller == address(0)) revert ListingNotExist();
        if (listing.status != Status.Active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        listing.status = Status.Cancelled;
        activeListing[listing.nftContract][listing.tokenId] = 0;
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId, "");
        emit ListingCancelled(listingId);
    }

    function withdrawFee() external onlyOwner nonReentrant {
        uint256 toWithdraw = accruedFees;

        if (toWithdraw == 0) revert WithdrawFailed();

        accruedFees = 0;

        (bool sent,) = payable(owner()).call{value: toWithdraw}("");
        if (!sent) revert TransferFailed();
    }

    function getMarketplaceFee() external pure returns (uint256) {
        return FEE_PERCENTAGE;
    }

    function getSellerListings(address seller) external view returns (Listing[] memory) {
        uint256 count;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].seller == seller && listings[i].status == Status.Active) {
                count++;
            }
        }

        Listing[] memory result = new Listing[](count);

        uint256 index;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].seller == seller && listings[i].status == Status.Active) {
                result[index++] = listings[i];
            }
        }

        return result;
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 count;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].status == Status.Active) {
                count++;
            }
        }

        Listing[] memory result = new Listing[](count);

        uint256 index;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].status == Status.Active) {
                result[index++] = listings[i];
            }
        }

        return result;
    }
}
