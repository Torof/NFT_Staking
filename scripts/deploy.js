// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const childChainManagerProxyPolygonMainnet = "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa"; // https://polygonscan.com/address/0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa#events
const rewardSpeed = 0;
const name = ""
const symbol = ""

async function main() {

  //contracts to deploy
  let NFTPOLYGON = await hre.ethers.getContractFactory("NFTPOLYGON") //NFTPOLYGON contract
  .then(contract => contract.deploy(childChainManagerProxyPolygonMainnet, name, symbol)) // Deploys with childChainManager on Polygon mainnet and sets name and symbol of Tokens
  .then(deployedContract => deployedContract.deployed()) //Deployed contract

  let Staking = await hre.ethers.getContractFactory("Staking") // Staking contract
  .then(contract => contract.deploy(NFTPOLYGON.address, rewardSpeed)) //Deploys with the NFT contract as owner and the base speed of ERC20 generation
  .then(deployedContract => deployedContract.deployed()) //Deployed contract

  let Ammo = await hre.ethers.getContractFactory("AMMO") // ERC20 contract
  .then(contract => contract.deploy(Staking.address)) // Deploys with Staking contract as owner
  .then(deployedContract => deployedContract.deployed()) // Deployed contract

  console.log("NFT deployed to:", NFTPOLYGON.address);
  console.log("Staking deployed to:", Staking.address);
  console.log("Ammo deployed to:", Ammo.address);

  await Staking.setERC20(Ammo.address)
  .then(result => result.wait()) // Set the ERC20 address to mint new tokens on staking
  await Staking.ammo()
  .then(result => console.log("Staking contract will mint from address:", result))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

