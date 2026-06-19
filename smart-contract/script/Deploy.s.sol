// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {PortoNFT} from "../src/PortoNFT.sol";
import {PortoMarketplace} from "../src/PortoMarketplace.sol";

contract DeployScript is Script {
    PortoNFT public nft;
    PortoMarketplace public marketplace;

    function run() public {
        vm.startBroadcast();

        nft = new PortoNFT("Porto NFT", "PNFT");

        marketplace = new PortoMarketplace();

        vm.stopBroadcast();
    }
}
