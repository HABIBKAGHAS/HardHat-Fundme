const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITAL_ANSWER,
  netwrokConfig,
} = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  log("Deploying FundMe...");
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  log("Deploying FundMe...", chainId, deployer);

  if (chainId == 31337) {
    log("Local network detected! Deploying Mocks...");
    try {
      await deploy("MockV3Aggregator", {
        contract: "MockV3Aggregator",
        from: deployer,
        log: true,
        args: [DECIMALS, INITAL_ANSWER],
      });
    } catch (error) {
      console.log(error);
    }

    log("Mocks deployed!");
    log("-----------------------------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
