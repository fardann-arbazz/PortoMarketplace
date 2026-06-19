// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PortoNFT.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract PortoNFTTest is Test {
    PortoNFT public nft;

    address public owner = address(this); // deployer = contractOwner
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    string constant URI = "ipfs://QmTest/1.json";
    string constant URI2 = "ipfs://QmTest/2.json";

    // ─── Mirror events ───────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function setUp() public {
        nft = new PortoNFT("PortoNFT", "PNFT");
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /// Mint satu token ke `to`, kembalikan tokenId
    function _mint(address ownerMint1) internal returns (uint256) {
        vm.prank(ownerMint1);
        return nft.mint(URI);
    }

    function _mint(address ownerMint2, string memory uri) internal returns (uint256) {
        vm.prank(ownerMint2);
        return nft.mint(uri);
    }

    function _mint() internal returns (uint256) {
        return _mint(address(this));
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 1 — Constructor
    // ═════════════════════════════════════════════════════════════

    function test_constructor_setsNameAndSymbol() public view {
        assertEq(nft.name(), "PortoNFT");
        assertEq(nft.symbol(), "PNFT");
    }

    function test_constructor_initialTotalSupplyZero() public view {
        assertEq(nft.totalSupply(), 0);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 2 — mint() happy path
    // ═════════════════════════════════════════════════════════════

    function test_mint_success_returnsTokenId() public {
        uint256 id = _mint();
        assertEq(id, 1); // nextTokenId mulai dari 1
    }

    function test_mint_success_tokenIdAutoIncrements() public {
        uint256 id1 = _mint();
        uint256 id2 = _mint();
        uint256 id3 = _mint();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
    }

    function test_mint_success_ownerOfCorrect() public {
        uint256 id = _mint(alice);
        assertEq(nft.ownerOf(id), alice);
    }

    function test_mint_success_balanceIncremented() public {
        _mint(alice);
        _mint(alice);
        assertEq(nft.balanceOf(alice), 2);
    }

    function test_mint_success_totalSupplyIncremented() public {
        _mint(alice);
        _mint(bob);
        assertEq(nft.totalSupply(), 2);
    }

    function test_mint_success_tokenURIStored() public {
        uint256 id = _mint(alice, "ipfs://custom-uri");
        assertEq(nft.tokenURI(id), "ipfs://custom-uri");
    }

    function test_mint_success_addedToOwnedTokens() public {
        uint256 id = _mint(alice);
        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], id);
    }

    function test_mint_success_emitsTransferFromZero() public {
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(0), alice, 1);
        _mint(alice);
    }

    function test_mint_multipleToSameOwner_ownedTokensCorrect() public {
        uint256 id1 = _mint(alice);
        uint256 id2 = _mint(alice);
        uint256 id3 = _mint(alice);

        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 3);
        assertEq(tokens[0], id1);
        assertEq(tokens[1], id2);
        assertEq(tokens[2], id3);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 3 — mint() revert cases
    // ═════════════════════════════════════════════════════════════

    function test_mint_revert_toZeroAddress() public {
        vm.expectRevert(PortoNFT.InvalidAddress.selector);
        nft.mint(URI);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 4 — burn() happy path
    // ═════════════════════════════════════════════════════════════

    function test_burn_success_ownerBecomesZero() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.burn(id);

        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, id));
        nft.ownerOf(id);
    }

    function test_burn_success_balanceDecremented() public {
        uint256 id = _mint(alice);
        _mint(alice);

        vm.prank(alice);
        nft.burn(id);

        assertEq(nft.balanceOf(alice), 1);
    }

    function test_burn_success_totalSupplyDecremented() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.burn(id);

        assertEq(nft.totalSupply(), 0);
    }

    function test_burn_success_tokenURIDeleted() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.burn(id);

        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, id));
        nft.tokenURI(id);
    }

    function test_burn_success_approvalCleared() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(bob, id);

        vm.prank(alice);
        nft.burn(id);

        // getApproved tidak revert untuk tokenId > 0 yang sudah burn
        // (approvals mapping di-delete saat burn)
        assertEq(nft.getApproved(id), address(0));
    }

    function test_burn_success_removedFromOwnedTokens() public {
        uint256 id1 = _mint(alice);
        uint256 id2 = _mint(alice);

        vm.prank(alice);
        nft.burn(id1);

        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], id2);
    }

    function test_burn_success_emitsTransferToZero() public {
        uint256 id = _mint(alice);

        vm.expectEmit(true, true, true, false);
        emit Transfer(alice, address(0), id);

        vm.prank(alice);
        nft.burn(id);
    }

    function test_burn_success_allowsRemintSameId() public {
        // tokenId auto-increment; tidak bisa mint tokenId yang sama secara manual
        // tapi setelah burn, counter terus maju — tokenId yang diburn tidak bisa dimint ulang
        // Test ini memverifikasi totalSupply tetap konsisten setelah burn
        uint256 id = _mint(alice);
        assertEq(nft.totalSupply(), 1);

        vm.prank(alice);
        nft.burn(id);
        assertEq(nft.totalSupply(), 0);

        // Mint baru mendapat tokenId baru (bukan recycle)
        uint256 newId = _mint(bob);
        assertEq(newId, id + 1); // bukan id yang sama
        assertEq(nft.totalSupply(), 1);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 5 — burn() revert cases
    // ═════════════════════════════════════════════════════════════

    function test_burn_revert_notOwner() public {
        uint256 id = _mint(alice);

        vm.prank(bob);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.burn(id);
    }

    function test_burn_revert_approvedCannotBurn() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(bob, id);

        vm.prank(bob);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.burn(id);
    }

    function test_burn_revert_unmintedToken() public {
        uint256 id = _mint(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, id));
        nft.burn(999);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 6 — transferFrom() happy path
    // ═════════════════════════════════════════════════════════════

    function test_transferFrom_success_byOwner() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.transferFrom(alice, bob, id);

        assertEq(nft.ownerOf(id), bob);
        assertEq(nft.balanceOf(alice), 0);
        assertEq(nft.balanceOf(bob), 1);
    }

    function test_transferFrom_success_byApproved() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(charlie, id);

        vm.prank(charlie);
        nft.transferFrom(alice, bob, id);

        assertEq(nft.ownerOf(id), bob);
    }

    function test_transferFrom_success_byOperator() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.setApprovalForAll(charlie, true);

        vm.prank(charlie);
        nft.transferFrom(alice, bob, id);

        assertEq(nft.ownerOf(id), bob);
    }

    function test_transferFrom_success_clearsApproval() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(charlie, id);

        vm.prank(alice);
        nft.transferFrom(alice, bob, id);

        assertEq(nft.getApproved(id), address(0));
    }

    function test_transferFrom_success_updatesOwnedTokens() public {
        uint256 id1 = _mint(alice);
        _mint(alice);

        vm.prank(alice);
        nft.transferFrom(alice, bob, id1);

        uint256[] memory aliceTokens = nft.getOwnedTokens(alice);
        uint256[] memory bobTokens = nft.getOwnedTokens(bob);

        assertEq(aliceTokens.length, 1);
        assertEq(bobTokens.length, 1);
        assertEq(bobTokens[0], id1);
    }

    function test_transferFrom_success_emitsTransferEvent() public {
        uint256 id = _mint(alice);

        vm.expectEmit(true, true, true, false);
        emit Transfer(alice, bob, id);

        vm.prank(alice);
        nft.transferFrom(alice, bob, id);
    }

    function test_transferFrom_success_toSelf() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.transferFrom(alice, alice, id);

        assertEq(nft.ownerOf(id), alice);
        assertEq(nft.balanceOf(alice), 1);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 7 — transferFrom() revert cases
    // ═════════════════════════════════════════════════════════════

    function test_transferFrom_revert_notOwnerNorApproved() public {
        uint256 id = _mint(alice);

        vm.prank(bob);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.transferFrom(alice, charlie, id);
    }

    function test_transferFrom_revert_toZeroAddress() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        vm.expectRevert(PortoNFT.InvalidAddress.selector);
        nft.transferFrom(alice, address(0), id);
    }

    function test_transferFrom_revert_tokenIdZero() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.transferFrom(alice, bob, 0);
    }

    function test_transferFrom_revert_wrongFromAddress() public {
        uint256 id1 = _mint(alice);
        _mint(charlie);

        // alice mencoba claim bahwa charlie adalah pengirim
        vm.prank(alice);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.transferFrom(charlie, bob, id1);

        // Balance charlie tidak berubah
        assertEq(nft.balanceOf(charlie), 1);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 8 — safeTransferFrom()
    // ═════════════════════════════════════════════════════════════

    function test_safeTransferFrom_success_toEOA() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.safeTransferFrom(alice, bob, id, "");

        assertEq(nft.ownerOf(id), bob);
    }

    function test_safeTransferFrom_success_toReceiver() public {
        MockERC721Receiver receiver = new MockERC721Receiver(true);
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.safeTransferFrom(alice, address(receiver), id, "");

        assertEq(nft.ownerOf(id), address(receiver));
    }

    function test_safeTransferFrom_revert_receiverRejectsTransfer() public {
        MockERC721Receiver badReceiver = new MockERC721Receiver(false);
        uint256 id = _mint(alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InvalidReceiver.selector, address(badReceiver)));

        nft.safeTransferFrom(alice, address(badReceiver), id, "");
    }

    function test_safeTransferFrom_revert_contractWithoutReceiver() public {
        // Contract yang tidak implement IERC721Receiver
        NonReceiver bad = new NonReceiver();
        uint256 id = _mint(alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721InvalidReceiver.selector, address(0)));

        nft.safeTransferFrom(alice, address(bad), id, "");
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 9 — approve() happy path
    // ═════════════════════════════════════════════════════════════

    function test_approve_success_byOwner() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(bob, id);

        assertEq(nft.getApproved(id), bob);
    }

    function test_approve_success_byOperator() public {
        // BUG FIX dari versi sebelumnya: operator sekarang bisa approve
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.setApprovalForAll(charlie, true);

        // charlie sebagai operator bisa approve orang lain
        vm.prank(charlie);
        nft.approve(bob, id);

        assertEq(nft.getApproved(id), bob);
    }

    function test_approve_success_emitsApprovalEvent() public {
        uint256 id = _mint(alice);

        vm.expectEmit(true, true, true, false);
        emit Approval(alice, bob, id);

        vm.prank(alice);
        nft.approve(bob, id);
    }

    function test_approve_success_overwriteExisting() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(bob, id);
        assertEq(nft.getApproved(id), bob);

        vm.prank(alice);
        nft.approve(charlie, id);
        assertEq(nft.getApproved(id), charlie);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 10 — approve() revert cases
    // ═════════════════════════════════════════════════════════════

    function test_approve_revert_notOwnerNorOperator() public {
        uint256 id = _mint(alice);

        vm.prank(bob);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.approve(charlie, id);
    }

    function test_approve_revert_toZeroAddress() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        vm.expectRevert(PortoNFT.InvalidAddress.selector);
        nft.approve(address(0), id);
    }

    function test_approve_revert_tokenIdZero() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.approve(bob, 0);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 11 — setApprovalForAll()
    // ═════════════════════════════════════════════════════════════

    function test_setApprovalForAll_success_setsTrue() public {
        vm.prank(alice);
        nft.setApprovalForAll(bob, true);

        assertTrue(nft.isApprovedForAll(alice, bob));
    }

    function test_setApprovalForAll_success_setsFalse() public {
        vm.startPrank(alice);
        nft.setApprovalForAll(bob, true);
        nft.setApprovalForAll(bob, false);
        vm.stopPrank();

        assertFalse(nft.isApprovedForAll(alice, bob));
    }

    function test_setApprovalForAll_success_emitsApprovalForAll() public {
        vm.expectEmit(true, true, false, true);
        emit ApprovalForAll(alice, bob, true);

        vm.prank(alice);
        nft.setApprovalForAll(bob, true);
    }

    function test_setApprovalForAll_revert_operatorZeroAddress() public {
        vm.prank(alice);
        vm.expectRevert(PortoNFT.InvalidAddress.selector);
        nft.setApprovalForAll(address(0), true);
    }

    function test_setApprovalForAll_operatorIndependentPerOwner() public {
        vm.prank(alice);
        nft.setApprovalForAll(charlie, true);

        // bob tidak memberikan approval ke charlie
        assertFalse(nft.isApprovedForAll(bob, charlie));
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 12 — View functions
    // ═════════════════════════════════════════════════════════════

    function test_ownerOf_revert_tokenIdZero() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.ownerOf(0);
    }

    function test_ownerOf_revert_unmintedToken() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));

        nft.ownerOf(999);
    }

    function test_balanceOf_revert_zeroAddress() public {
        vm.expectRevert(PortoNFT.InvalidAddress.selector);
        nft.balanceOf(address(0));
    }

    function test_balanceOf_returnsZeroForNoTokens() public view {
        assertEq(nft.balanceOf(alice), 0);
    }

    function test_tokenURI_revert_tokenIdZero() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.tokenURI(0);
    }

    function test_tokenURI_revert_unmintedToken() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.tokenURI(999);
    }

    function test_getApproved_revert_tokenIdZero() public {
        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.getApproved(0);
    }

    function test_getApproved_returnsZeroWhenNoApproval() public {
        uint256 id = _mint(alice);
        assertEq(nft.getApproved(id), address(0));
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 13 — getOwnedTokens()
    // ═════════════════════════════════════════════════════════════

    function test_getOwnedTokens_emptyInitially() public view {
        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 0);
    }

    function test_getOwnedTokens_updatesOnMint() public {
        _mint(alice);
        _mint(alice);

        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 2);
    }

    function test_getOwnedTokens_updatesOnTransfer() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.transferFrom(alice, bob, id);

        assertEq(nft.getOwnedTokens(alice).length, 0);
        assertEq(nft.getOwnedTokens(bob).length, 1);
    }

    function test_getOwnedTokens_updatesOnBurn() public {
        uint256 id1 = _mint(alice);
        uint256 id2 = _mint(alice);

        vm.prank(alice);
        nft.burn(id1);

        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 1);
        assertEq(tokens[0], id2);
    }

    function test_getOwnedTokens_swapAndPopOrder() public {
        // Verifikasi swap-and-pop: saat burn token di tengah,
        // token terakhir mengisi posisinya
        uint256 id1 = _mint(alice);
        uint256 id2 = _mint(alice);
        uint256 id3 = _mint(alice);

        // Burn id1 (index 0) → id3 mengisi index 0
        vm.prank(alice);
        nft.burn(id1);

        uint256[] memory tokens = nft.getOwnedTokens(alice);
        assertEq(tokens.length, 2);
        // id3 sekarang di index 0 (swap-and-pop)
        assertEq(tokens[0], id3);
        assertEq(tokens[1], id2);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 14 — Edge Cases
    // ═════════════════════════════════════════════════════════════

    function test_edge_totalSupplyConsistentAfterMintBurn() public {
        _mint(alice);
        _mint(alice);
        assertEq(nft.totalSupply(), 2);

        vm.prank(alice);
        nft.burn(1);
        assertEq(nft.totalSupply(), 1);

        vm.prank(alice);
        nft.burn(2);
        assertEq(nft.totalSupply(), 0);
    }

    function test_edge_multipleTokensMultipleOwners() public {
        _mint(alice);
        _mint(alice);
        _mint(bob);

        assertEq(nft.balanceOf(alice), 2);
        assertEq(nft.balanceOf(bob), 1);
        assertEq(nft.totalSupply(), 3);
    }

    function test_edge_operatorCanTransferAllTokens() public {
        uint256 id1 = _mint(alice);
        uint256 id2 = _mint(alice);

        vm.prank(alice);
        nft.setApprovalForAll(charlie, true);

        vm.prank(charlie);
        nft.transferFrom(alice, bob, id1);

        vm.prank(charlie);
        nft.transferFrom(alice, bob, id2);

        assertEq(nft.balanceOf(alice), 0);
        assertEq(nft.balanceOf(bob), 2);
    }

    function test_edge_approvedExpiredAfterTransfer() public {
        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(charlie, id);

        // Transfer ke bob
        vm.prank(alice);
        nft.transferFrom(alice, bob, id);

        // charlie tidak bisa transfer lagi
        vm.prank(charlie);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.transferFrom(bob, alice, id);
    }

    function test_edge_revokeApprovalForAllPreventsTransfer() public {
        uint256 id = _mint(alice);

        vm.startPrank(alice);
        nft.setApprovalForAll(charlie, true);
        nft.setApprovalForAll(charlie, false);
        vm.stopPrank();

        vm.prank(charlie);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.transferFrom(alice, bob, id);
    }

    // ═════════════════════════════════════════════════════════════
    // SECTION 15 — Fuzz Tests
    // ═════════════════════════════════════════════════════════════

    function testFuzz_mint_anyValidRecipient(address to) public {
        vm.assume(to != address(0));

        uint256 id = nft.mint(URI);

        assertEq(nft.ownerOf(id), to);
        assertEq(nft.balanceOf(to), 1);
        assertEq(nft.totalSupply(), 1);
        assertEq(nft.tokenURI(id), URI);
    }

    function testFuzz_burn_byOwner(address to) public {
        vm.assume(to != address(0));

        uint256 id = _mint(to);

        vm.prank(to);
        nft.burn(id);

        vm.expectRevert(abi.encodeWithSelector(IERC721Errors.ERC721NonexistentToken.selector, 0));
        nft.ownerOf(id);

        assertEq(nft.balanceOf(to), 0);
        assertEq(nft.totalSupply(), 0);
    }

    function testFuzz_burn_nonOwnerReverts(address owner_, address attacker_) public {
        vm.assume(owner_ != address(0));
        vm.assume(attacker_ != address(0));
        vm.assume(attacker_ != owner_);

        uint256 id = _mint(owner_);

        vm.prank(attacker_);
        vm.expectRevert(PortoNFT.NotOwner.selector);
        nft.burn(id);
    }

    function testFuzz_transferFrom_byOwner(address from, address to) public {
        vm.assume(from != address(0));
        vm.assume(to != address(0));
        vm.assume(from != to);

        uint256 id = _mint(from);

        vm.prank(from);
        nft.transferFrom(from, to, id);

        assertEq(nft.ownerOf(id), to);
        assertEq(nft.balanceOf(from), 0);
        assertEq(nft.balanceOf(to), 1);
    }

    function testFuzz_approvedClearedAfterTransfer(address approved, address to) public {
        vm.assume(approved != address(0));
        vm.assume(to != address(0));

        uint256 id = _mint(alice);

        vm.prank(alice);
        nft.approve(approved, id);

        vm.prank(alice);
        nft.transferFrom(alice, to, id);

        assertEq(nft.getApproved(id), address(0));
    }

    function testFuzz_totalSupply_consistentAfterMintBurn(uint8 count) public {
        vm.assume(count > 0 && count <= 20);

        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = _mint(alice);
        }
        assertEq(nft.totalSupply(), count);

        for (uint256 i = 0; i < count; i++) {
            vm.prank(alice);
            nft.burn(ids[i]);
        }
        assertEq(nft.totalSupply(), 0);
    }

    function testFuzz_balanceConsistent(uint8 count) public {
        vm.assume(count > 0 && count <= 20);

        for (uint256 i = 0; i < count; i++) {
            _mint(alice);
        }
        assertEq(nft.balanceOf(alice), count);
        assertEq(nft.getOwnedTokens(alice).length, count);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Contracts
// ─────────────────────────────────────────────────────────────────────────────

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// Contract yang implement IERC721Receiver dengan return value yang bisa dikontrol
contract MockERC721Receiver is IERC721Receiver {
    bool private _accept;

    constructor(bool accept) {
        _accept = accept;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external view override returns (bytes4) {
        if (_accept) {
            return IERC721Receiver.onERC721Received.selector;
        } else {
            return bytes4(0xdeadbeef); // selector salah → TransferFailed
        }
    }
}

/// Contract yang tidak implement IERC721Receiver sama sekali
contract NonReceiver {}
