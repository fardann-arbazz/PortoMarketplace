// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PortoMarketplace.sol";
import "../src/PortoNFT.sol";

contract PortoMarketplaceFuzzTest is Test {
    PortoMarketplace public marketplace;
    PortoNFT public nft;

    address public owner = makeAddr("owner");
    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");

    string constant URI = "ipfs://QmTest";

    function setUp() public {
        vm.startPrank(owner);
        marketplace = new PortoMarketplace();
        nft = new PortoNFT("PortoNFT", "PNFT");
        vm.stopPrank();

        vm.deal(buyer, 1000 ether);
    }

    // ─── Helper ──────────────────────────────────────────────────

    /// Mint satu token ke seller, list dengan harga tertentu, return (tokenId, listingId)
    function _mintAndList(uint96 price) internal returns (uint64 tokenId, uint256 listingId) {
        vm.prank(owner);
        tokenId = uint64(nft.mint(URI));

        vm.startPrank(seller);
        nft.approve(address(marketplace), tokenId);
        listingId = marketplace.nextListingId();
        marketplace.listNFT(address(nft), tokenId, price);
        vm.stopPrank();
    }

    // ═════════════════════════════════════════════════════════════
    // Fuzz: listNFT — price range
    // ═════════════════════════════════════════════════════════════

    function testFuzz_list_anyValidPrice(uint96 price) public {
        vm.assume(price > 0);

        (, uint256 id) = _mintAndList(price);

        PortoMarketplace.Listing memory l = marketplace.getListing(id);
        assertEq(l.price, price);
        assertEq(uint8(l.status), uint8(PortoMarketplace.Status.Active));
    }

    function testFuzz_list_priceZeroReverts(address anyNFT, uint64 tokenId) public {
        vm.assume(anyNFT != address(0));
        vm.assume(tokenId > 0);

        vm.prank(seller);
        vm.expectRevert(PortoMarketplace.PriceMustBeAboveZero.selector);
        marketplace.listNFT(anyNFT, tokenId, 0);
    }

    function testFuzz_list_nextListingIdIncreases(uint8 count) public {
        vm.assume(count > 0 && count <= 20);

        uint256 initialId = marketplace.nextListingId();

        for (uint256 i = 0; i < count; i++) {
            vm.prank(owner);
            uint64 tokenId = uint64(nft.mint(URI));

            vm.startPrank(seller);
            nft.approve(address(marketplace), tokenId);
            marketplace.listNFT(address(nft), tokenId, 1 ether);
            vm.stopPrank();
        }

        assertEq(marketplace.nextListingId(), initialId + count);
    }

    // ═════════════════════════════════════════════════════════════
    // Fuzz: buyNFT — payment amount
    // ═════════════════════════════════════════════════════════════

    function testFuzz_buy_exactOrAbovePrice_succeeds(uint96 price, uint96 overpay) public {
        vm.assume(price > 0 && price <= 10 ether);
        vm.assume(overpay <= 10 ether);

        uint256 totalPayment = uint256(price) + uint256(overpay);

        (, uint256 id) = _mintAndList(price);

        uint256 sellerBefore = seller.balance;

        vm.deal(buyer, totalPayment);
        uint256 buyerBefore = buyer.balance;

        vm.prank(buyer);
        marketplace.buyNFT{value: totalPayment}(id);

        uint256 fee = (uint256(price) * marketplace.FEE_PERCENTAGE()) / 10000;

        assertEq(seller.balance, sellerBefore + price - fee);

        assertEq(buyer.balance, buyerBefore - price);

        assertEq(marketplace.accruedFees(), fee);
    }

    function testFuzz_buy_belowPriceReverts(uint96 price, uint96 payment) public {
        vm.assume(price > 0 && price <= 10 ether);
        vm.assume(payment < price);

        (, uint256 id) = _mintAndList(price);

        vm.deal(buyer, payment);
        vm.prank(buyer);
        vm.expectRevert(PortoMarketplace.InsufficientPayment.selector);
        marketplace.buyNFT{value: payment}(id);
    }

    function testFuzz_buy_feeAlwaysCorrect(uint96 price) public {
        vm.assume(price > 0 && price <= 50 ether);

        (, uint256 id) = _mintAndList(price);

        vm.deal(buyer, price);
        vm.prank(buyer);
        marketplace.buyNFT{value: price}(id);

        uint256 expectedFee = (uint256(price) * 250) / 10000;
        assertEq(marketplace.accruedFees(), expectedFee);
        assertLe(expectedFee, price); // fee tidak pernah melebihi harga
    }

    function testFuzz_buy_sellerAmountAlwaysCorrect(uint96 price) public {
        vm.assume(price > 0 && price <= 50 ether);

        (, uint256 id) = _mintAndList(price);

        uint256 sellerBefore = seller.balance;
        vm.deal(buyer, price);
        vm.prank(buyer);
        marketplace.buyNFT{value: price}(id);

        uint256 fee = (uint256(price) * 250) / 10000;
        uint256 expected = uint256(price) - fee;
        assertEq(seller.balance - sellerBefore, expected);
    }

    // ═════════════════════════════════════════════════════════════
    // Fuzz: updateListingPrice
    // ═════════════════════════════════════════════════════════════

    function testFuzz_updatePrice_anyValidPrice(uint96 newPrice) public {
        vm.assume(newPrice > 0);

        (, uint256 id) = _mintAndList(1 ether);

        vm.prank(seller);
        marketplace.updateListingPrice(id, newPrice);

        assertEq(marketplace.getListing(id).price, newPrice);
    }

    // ═════════════════════════════════════════════════════════════
    // Fuzz: seller address
    // ═════════════════════════════════════════════════════════════

    function testFuzz_listAndBuy_anySellerEOA(address fuzzSeller) public {
        vm.assume(fuzzSeller != address(0));
        vm.assume(fuzzSeller != owner);
        vm.assume(fuzzSeller != buyer);
        vm.assume(fuzzSeller.code.length == 0); // EOA only

        // hindari precompile dan address spesial
        vm.assume(uint160(fuzzSeller) > 100);

        vm.deal(fuzzSeller, 1 ether);

        vm.prank(owner);
        uint64 tokenId = uint64(nft.mint(URI));

        vm.startPrank(fuzzSeller);
        nft.approve(address(marketplace), tokenId);
        uint256 id = marketplace.nextListingId();
        marketplace.listNFT(address(nft), tokenId, 1 ether);
        vm.stopPrank();

        uint256 sellerBefore = fuzzSeller.balance;
        uint256 fee = (1 ether * 250) / 10000;

        vm.prank(buyer);
        marketplace.buyNFT{value: 1 ether}(id);

        assertEq(nft.ownerOf(tokenId), buyer);
        assertEq(fuzzSeller.balance, sellerBefore + 1 ether - fee);
    }

    // ═════════════════════════════════════════════════════════════
    // Fuzz: accruedFees akumulasi benar
    // ═════════════════════════════════════════════════════════════

    function testFuzz_accruedFees_sumOfSales(uint8 saleCount) public {
        vm.assume(saleCount > 0 && saleCount <= 10);

        uint256 totalExpectedFees;

        for (uint256 i = 0; i < saleCount; i++) {
            uint96 price = uint96(0.1 ether * (i + 1));
            (, uint256 id) = _mintAndList(price);

            uint256 fee = (uint256(price) * 250) / 10000;
            totalExpectedFees += fee;

            vm.deal(buyer, price);
            vm.prank(buyer);
            marketplace.buyNFT{value: price}(id);
        }

        assertEq(marketplace.accruedFees(), totalExpectedFees);
    }
}
