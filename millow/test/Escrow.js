// test
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { it, describe } = require("mocha");

// const tokens = (n) => {
//     return ethers.utils.parseUnits(n.toString(), "ether");
// };

describe("Escrow", () => {
    let realEstate, escrow;
    let /* buyer, */ seller, inspector, lender;

    it("Returns NFT address", async () => {});

    it("Returns seller", async () => {});

    it("Returns inspector", async () => {});

    it("Returns lender", async () => {});

    it("saves the address", async () => {
        // Setup accounts
        [/* buyer */ seller, inspector, lender] = await ethers.getSigners();

        // Deploy Real Estate Contract
        const RealEstate = await ethers.getContractFactory("RealEstate");
        realEstate = await RealEstate.deploy();
        console.log("realEstate.address: " + realEstate.address);
        // Mint
        let transaction = await realEstate
            .connect(seller)
            .mint(
                "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS",
            );
        await transaction.wait();
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address,
        );

        let result = await escrow.nftAddress();
        expect(result).to.equal(realEstate.address);

        result = await escrow.seller();
        expect(result).to.equal(seller.address);
    });
});
