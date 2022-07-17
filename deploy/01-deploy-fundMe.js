const { network } = require("hardhat");
const {
  developmentChains,
  netwrokConfig,
} = require("../helper-hardhat-config");
module.exports.default = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregatir = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregatir.address;
  } else {
    netwrokConfig[chainId].ethUsdPriceFeed;
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
  });
  log("-----------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
