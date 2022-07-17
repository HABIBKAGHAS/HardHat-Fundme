const { assert } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");
describe("FundMe", async function () {
  let fundme;
  let deployer;
  let mockV3Aggregator;
  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundme = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the Aggregator addresses correctly", async function () {
      const response = await fundme.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
});
