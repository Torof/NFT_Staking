// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const rewardSpeed = 864; // To generate $AMMO a day (without multiplier)

async function main() {
  //contracts to deploy
  let NFT = await hre.ethers.getContractFactory("NFT") //NFT contract
  .then(contract => contract.deploy()) // Deploys with childChainManager on Polygon mainnet and sets name and symbol of Tokens
  .then(deployedContract => deployedContract.deployed()) //Deployed contract

  let Staking = await hre.ethers.getContractFactory("Staking") // Staking contract
  .then(contract => contract.deploy(NFT.address, rewardSpeed)) //Deploys with the NFT contract as owner and the base speed of ERC20 generation
  .then(deployedContract => deployedContract.deployed()) //Deployed contract

  let Ammo = await hre.ethers.getContractFactory("AMMO") // ERC20 contract
  .then(contract => contract.deploy(Staking.address)) // Deploys with Staking contract as owner
  .then(deployedContract => deployedContract.deployed()) // Deployed contract

  console.log("NFT deployed to:", NFT.address);
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

