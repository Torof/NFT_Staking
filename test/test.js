const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * 
 * 
 * 
 */

describe("Staking NFTs  and getting ERC20 token as reward",async function () {
  before(async function(){
    const childChainManagerProxyPolygonMumbai = "0xb5505a6d998549090530911180f38aC5130101c6";
    const rewardSpeed = 36;
    const name = "Champions"
    const symbol = "CHAMPS"

    const [owner, acc2] = await ethers.getSigners();
    
    global.owner = owner.address
    global.acc2 = acc2.address
    

  global.NFTPOLYGON = await hre.ethers.getContractFactory("NFTPOLYGON") //NFTPOLYGON contract
  .then(contract => contract.deploy(childChainManagerProxyPolygonMumbai, name, symbol)) // Deploys with childChainManager on Mumbai
  .then(deployedContract => deployedContract.deployed()) //Deployed contract
  
  global.Staking = await hre.ethers.getContractFactory("Staking") // Staking contract
  .then(contract => contract.deploy(NFTPOLYGON.address, rewardSpeed)) //Deploys with the NFT contract as owner
  .then(deployedContract => deployedContract.deployed()) //Deployed contract
  
  global.Ammo = await hre.ethers.getContractFactory("AMMO") // ERC20 contract
  .then(contract => contract.deploy(Staking.address)) // Deploys with Staking contract as owner
  .then(deployedContract => deployedContract.deployed()) // Deployed contract

  await Staking.setERC20(Ammo.address)
  .then(result => result.wait()) // Set the ERC20 address to mint new tokens on staking
  })

  it("should verify the contract metadata", async () => {
    expect(await global.NFTPOLYGON.name()).to.equal("Champions");
    expect(await global.NFTPOLYGON.symbol()).to.equal("CHAMPS");
    expect(await global.NFTPOLYGON.totalSupply()).to.equal(0);
  })

  it("should mint 3 NFT", async function () {
    await global.NFTPOLYGON.mint()
    .then(tx => tx.wait())

    await global.NFTPOLYGON.mint()
    .then(tx => tx.wait())

    await global.NFTPOLYGON.mint()
    .then(tx => tx.wait())

    expect(await global.NFTPOLYGON.totalSupply()).to.equal(3);

  });

  it("should transfer NFT to the staking contract and Staking contract address to be the owner of NFT", async function (){
    expect(await global.NFTPOLYGON.ownerOf(0)).to.equal(global.owner)
    await global.NFTPOLYGON["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 0) //Use this way because of overriden function
    expect(await global.NFTPOLYGON.ownerOf(0)).to.equal(global.Staking.address)
  })

  it("User should have 1 NFT in staking", async function (){
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(1)
  })

  it("multiplier should be 11 more after each staking", async function (){
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(10)

    await global.NFTPOLYGON["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 1)

    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(21)

    await global.NFTPOLYGON["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 2)

    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(32)
  })

  it("user should already have received gains", async function (){
    expect(await global.Ammo.balanceOf(global.owner)).to.not.equal(0)
  })

  it("user should have 3 NFT in staking", async function(){
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(3)
  })

  it("should add to erc20 balance on manual claiming, last claim time to now, claim balance added", async function () {
    let bal = await global.Ammo.balanceOf(global.owner)
    let lastClaim = await global.Staking.stakingInfo(global.owner).then(r => r.lastClaim)
    await global.Staking.claim()
    let bal2 = await global.Ammo.balanceOf(global.owner)
    let lastClaim2 = await global.Staking.stakingInfo(global.owner).then(r => r.lastClaim)
    let claimed = await global.Staking.stakingInfo(global.owner).then(r => r.claimed)
    expect(bal).to.not.equal(bal2)
    expect(bal2).to.equal(claimed)
    expect(lastClaim).to.not.equal(lastClaim2)
  })

  it("should unstake token id 1 and receive more gains and multplier should be 11 less", async function(){
    let bal = await global.Ammo.balanceOf(global.owner)
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(32)

    await global.Staking.unstake(0)
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(2)

    let bal2 = await global.Ammo.balanceOf(global.owner)
    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(21)
    
    expect(bal).to.not.equal(bal2)

  })

  it("should unstake all multiplier and staked number be 0", async function() {
    await global.Staking.unstake(1)
    await global.Staking.unstake(2)
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(numOfStaking).to.equal(0)
    expect(multiplier).to.equal(0)
  })

  it("user should be able to transfer ERC20", async function() {
    let balAcc = await global.Ammo.balanceOf(global.acc2)
    expect(balAcc).to.equal(0)

    await global.Ammo.transfer(global.acc2, 2 )

    let balAcc2 = await global.Ammo.balanceOf(global.acc2)

    expect(balAcc2).to.equal(balAcc + 2)
  })
});
