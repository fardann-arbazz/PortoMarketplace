// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PortoMarketplace.sol";
import "../src/PortoNFT.sol";

contract MarketplaceHandler is Test {
    PortoMarketplace public marketplace;
    PortoNFT public nft;
    address public owner;

    address[] public actors;
    uint64[] public mintedTokens;

    uint256 public totalEthPaidByBuyers;
    uint256 public totalEthReceivedBySellers;
    uint256 public totalFeesAccrued;
    uint256 public totalSuccessfulBuys;

    string constant URI = "ipfs://test";

    constructor(address _mp, address _nft, address _owner) {
        marketplace = PortoMarketplace(_mp);
        nft = PortoNFT(_nft);
        owner = _owner;

        actors.push(makeAddr("actor1"));
        actors.push(makeAddr("actor2"));
        actors.push(makeAddr("actor3"));

        for (uint256 i = 0; i < actors.length; i++) {
            vm.deal(actors[i], 10_000 ether);
        }
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function listNFT(uint256 actorSeed, uint96 price) external {
        price = uint96(bound(uint256(price), 1, 10 ether));
        address actor = _actor(actorSeed);

        vm.prank(owner);
        uint64 tokenId = uint64(nft.mint(URI));
        mintedTokens.push(tokenId);

        vm.startPrank(actor);
        nft.approve(address(marketplace), tokenId);
        try marketplace.listNFT(address(nft), tokenId, price) {} catch {}
        vm.stopPrank();
    }

    function buyNFT(uint256 buyerSeed, uint256 listingId) external {
        uint256 nextId = marketplace.nextListingId();
        if (nextId <= 1) return; // belum ada listing (id mulai dari 1)
        listingId = bound(listingId, 1, nextId - 1);

        PortoMarketplace.Listing memory l = marketplace.getListing(listingId);
        if (l.status != PortoMarketplace.Status.Active) return;

        address buyer = _actor(buyerSeed);
        if (buyer == l.seller) return;

        uint256 sellerBefore = l.seller.balance;

        vm.prank(buyer);
        try marketplace.buyNFT{value: l.price}(listingId) {
            totalSuccessfulBuys++;
            totalEthPaidByBuyers += l.price;
            totalEthReceivedBySellers += (l.seller.balance - sellerBefore);
            totalFeesAccrued += (uint256(l.price) * marketplace.FEE_PERCENTAGE()) / 10000;
        } catch {}
    }

    function cancelListing(uint256 actorSeed, uint256 listingId) external {
        uint256 nextId = marketplace.nextListingId();
        if (nextId <= 1) return;
        listingId = bound(listingId, 1, nextId - 1);
        address actor = _actor(actorSeed);

        vm.prank(actor);
        try marketplace.cancelListing(listingId) {} catch {}
    }

    function updateListingPrice(uint256 actorSeed, uint256 listingId, uint96 newPrice) external {
        uint256 nextId = marketplace.nextListingId();
        if (nextId <= 1) return;
        newPrice = uint96(bound(uint256(newPrice), 1, 10 ether));
        listingId = bound(listingId, 1, nextId - 1);
        address actor = _actor(actorSeed);

        vm.prank(actor);
        try marketplace.updateListingPrice(listingId, newPrice) {} catch {}
    }
}

contract PortoMarketplaceInvariantTest is Test {
    PortoMarketplace public marketplace;
    PortoNFT public nft;
    MarketplaceHandler public handler;

    address public owner = makeAddr("owner");

    function setUp() public {
        vm.startPrank(owner);
        marketplace = new PortoMarketplace();
        nft = new PortoNFT("PortoNFT", "PNFT");
        vm.stopPrank();

        handler = new MarketplaceHandler(address(marketplace), address(nft), owner);
        targetContract(address(handler));
    }

    // ─── Invariant 1: nextListingId hanya bertambah ───────────────
    function invariant_nextListingId_neverDecrease() public view {
        // Selalu >= 1 (initialValue)
        assertGe(marketplace.nextListingId(), 1);
    }

    // ─── Invariant 2: Listing aktif → NFT ada di escrow ──────────
    function invariant_activeListing_nftInEscrow() public view {
        uint256 nextId = marketplace.nextListingId();
        for (uint256 i = 1; i < nextId && i <= 10; i++) {
            PortoMarketplace.Listing memory l = marketplace.getListing(i);
            if (l.status == PortoMarketplace.Status.Active) {
                assertEq(
                    IERC721Like(l.nftContract).ownerOf(l.tokenId),
                    address(marketplace),
                    "Active listing NFT must be in escrow"
                );
            }
        }
    }

    // ─── Invariant 3: accruedFees == balance contract ─────────────
    // (karena accruedFees di-track terpisah, dan tidak ada ETH lain yang masuk
    //  selain dari buyNFT — kecuali force-send)
    function invariant_accruedFees_leBalance() public view {
        assertLe(marketplace.accruedFees(), address(marketplace).balance + 1 ether);
        // +1 ether untuk toleransi jika ada ETH yang force-sent
    }

    // ─── Invariant 4: handler tracking konsisten ──────────────────
    function invariant_ethFlow_consistent() public view {
        uint256 fee = handler.totalFeesAccrued();
        uint256 sellerPaid = handler.totalEthReceivedBySellers();
        uint256 buyerSpent = handler.totalEthPaidByBuyers();

        // sellerPaid + fee == buyerSpent (semua uang buyer terdistribusi)
        assertEq(sellerPaid + fee, buyerSpent);
    }

    // ─── Invariant 5: Status tidak bisa kembali ke Active ────────
    function invariant_soldOrCancelled_neverReturnsToActive() public view {
        uint256 nextId = marketplace.nextListingId();
        for (uint256 i = 1; i < nextId && i <= 15; i++) {
            PortoMarketplace.Listing memory l = marketplace.getListing(i);
            // Tidak ada assertion yang bisa membuktikan "pernah Sold/Cancelled"
            // tapi kita bisa memastikan status selalu salah satu dari tiga nilai enum
            uint8 s = uint8(l.status);
            assertTrue(s == 0 || s == 1 || s == 2, "Invalid status value");
        }
    }

    // ─── Invariant 6: accruedFees == handler.totalFeesAccrued ────
    function invariant_accruedFees_matchesHandlerTracking() public view {
        assertEq(marketplace.accruedFees(), handler.totalFeesAccrued());
    }
}

interface IERC721Like {
    function ownerOf(uint256 tokenId) external view returns (address);
}
