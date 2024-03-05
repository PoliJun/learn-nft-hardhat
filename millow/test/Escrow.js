// test
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { it, describe } = require("mocha");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
};

let realEstate;

describe("Escrow", () => {
    it("saves the address", async () => {
        const RealEstate = await ethers.getContractFactory("RealEstate");
        realEstate = await RealEstate.deploy();
        console.log(realEstate.address);
    });
});
