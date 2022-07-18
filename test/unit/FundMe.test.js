const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundme;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); // 1 ETH
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture();
        fundme = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("sets the Aggregator addresses correctly", async function () {
          const response = await fundme.priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("it fails if you don't send enough ETH", async function () {
          await expect(fundme.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("update the amount funded data structure", async function () {
          await fundme.fund({ value: sendValue });
          const response = await fundme.addressToAmountFunded(deployer);

          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async function () {
          await fundme.fund({ value: sendValue });
          const response = await fundme.funders(0);
          assert.equal(response.toString(), deployer);
        });
      });

      describe("Withdraw", async function () {
        beforeEach(async function () {
          await fundme.fund({ value: sendValue });
        });

        it("Withdraw ETH from a single funder", async function () {
          //Arrange
          const startingFundMeBalance = await fundme.provider.getBalance(
            fundme.address
          );

          const startingDeployerbalance = await fundme.provider.getBalance(
            deployer
          );
          //Act
          const transactionResponse = await fundme.withdraw();
          const transactionReciept = await transactionResponse.wait(1);

          const gasCost = transactionReciept.gasUsed.mul(
            transactionReciept.effectiveGasPrice
          );

          const endingFundMeBalance = await fundme.provider.getBalance(
            fundme.address
          );
          const endingDeployerBalance = await fundme.provider.getBalance(
            deployer
          );
          //assert

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerbalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("Withdraw ETH from multiple funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < accounts.length; i++) {
            const fundMeConnectContract = await fundme.connect(accounts[i]);
            await fundMeConnectContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await fundme.provider.getBalance(
            fundme.address
          );
          const startingDeployerbalance = await fundme.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundme.withdraw();
          const transactionReciept = await transactionResponse.wait(1);

          const gasCost = transactionReciept.gasUsed.mul(
            transactionReciept.effectiveGasPrice
          );

          const endingFundMeBalance = await fundme.provider.getBalance(
            fundme.address
          );
          const endingDeployerBalance = await fundme.provider.getBalance(
            deployer
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerbalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          expect(fundme.funders(0)).to.be.revertedWith("");

          for (let i = 1; i < accounts.length; i++) {
            assert.equal(
              await fundme.addressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("it fails if you are not the owner", async function () {
          const response = await fundme.withdraw();
          const accounts = await ethers.getSigners();
          const fundMeConnectContract = await fundme.connect(accounts[1]);
          await expect(
            fundMeConnectContract.withdraw()
          ).to.be.revertedWithCustomError(
            fundMeConnectContract,
            "FundMe__NotOwner"
          );
        });
      });
    });
