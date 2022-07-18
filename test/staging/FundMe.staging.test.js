const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
require("dotenv").config();

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundme;
      let deployer;
      const sendValue = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundme = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund withdraw", async function () {
        await fundme.fund({ value: sendValue });
        await fundme.withdraw();

        const endingBalance = await fundme.provider.getBalance(fundme.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
