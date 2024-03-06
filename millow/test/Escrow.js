// test
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { it, describe, beforeEach } = require("mocha");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Escrow", () => {
    let realEstate, escrow;
    let buyer, seller, inspector, lender;
    beforeEach(async () => {
        // Setup accounts
        [buyer, seller, inspector, lender] = await ethers.getSigners();

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
        console.log("escrow.address: " + escrow.address);
        console.log(
            "msg.sender: " + (await ethers.provider.getSigner().getAddress()),
        );
        console.log("owner of: " + (await realEstate.ownerOf(1)));

        // Approve property
        transaction = await realEstate
            .connect(seller)
            .approve(escrow.address, 1);
        await transaction.wait();

        // List property
        transaction = await escrow
            .connect(seller)
            .list(1, buyer.address, tokens(10), tokens(5));
        await transaction.wait();
    });
    describe("Deployment", () => {
        it("Returns NFT address", async () => {
            const result = await escrow.nftAddress();
            expect(result).to.equal(realEstate.address);
        });

        it("Returns seller", async () => {
            const result = await escrow.seller();
            expect(result).to.equal(seller.address);
        });

        it("Returns inspector", async () => {
            const result = await escrow.inspector();
            expect(result).to.equal(inspector.address);
        });

        it("Returns lender", async () => {
            const result = await escrow.lender();
            expect(result).to.equal(lender.address);
        });
        describe("Listing", async () => {
            it("update is listed", async () => {
                const result = await escrow.isListed(1);
                expect(result).to.equal(true);
            });
            it("Returns price", async () => {
                const result = await escrow.price(1);
                expect(result).to.equal(tokens(10));
            });
            it("Returns escrow amount", async () => {
                const result = await escrow.escrowAmount(1);
                expect(result).to.equal(tokens(5));
            });
            it("Returns buyer", async () => {
                const result = await escrow.buyer(1);
                expect(result).to.equal(buyer.address);
            });
            it("Updates ownership", async () => {
                expect(await realEstate.ownerOf(1)).to.equal(escrow.address);
            });
        });

        describe('Deposit', async () => {
            it('Updates contract balance', async () => {
                const transaction= await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)});
                await transaction.wait();
                const result = await escrow.getBalance();
                expect(result).to.equal(tokens(5));
            });
            
        });

    });
});
