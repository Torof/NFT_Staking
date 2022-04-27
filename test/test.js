const { expect, should } = require("chai");
const { ethers } = require("hardhat");


/**
 * 
 * 
 * 
 */

describe("Staking NFTs  and getting ERC20 token as reward",async function () {
  before(async function(){

    const [owner, acc2] = await ethers.getSigners();
    let rewardSpeed = 864;
    
    global.owner = owner.address
    global.acc2 = acc2.address
    global.acc2Signer = acc2
    
    
  global.NFT = await hre.ethers.getContractFactory("NFT") //NFT contract
  .then(contract => contract.deploy())
  .then(deployedContract => deployedContract.deployed()) //Deployed contract

  global.NFT2 = await hre.ethers.getContractFactory("NFT") //NFT contract for security testing
  .then(contract => contract.deploy())
  .then(deployedContract => deployedContract.deployed()) //Deployed contract
  
  global.Staking = await hre.ethers.getContractFactory("Staking") // Staking contract
  .then(contract => contract.deploy(NFT.address, rewardSpeed)) //Deploys with the NFT contract as owner
  .then(deployedContract => deployedContract.deployed()) //Deployed contract
  
  global.Ammo = await hre.ethers.getContractFactory("AMMO") // ERC20 contract
  .then(contract => contract.deploy(Staking.address)) // Deploys with Staking contract as owner
  .then(deployedContract => deployedContract.deployed()) // Deployed contract

  await Staking.setERC20(Ammo.address)
  .then(result => result.wait()) // Set the ERC20 address to mint new tokens on staking
  })

  it("should verify the contract metadata", async () => { //Tokens data are hardcoded and 10 are minted upon deployment for testing.
    expect(await global.NFT.name()).to.equal("Champions");
    expect(await global.NFT.symbol()).to.equal("CHAMPS");
    expect(await global.NFT.totalSupply()).to.equal(20);
  })

  it("should transfer NFT to the staking contract and Staking contract address to be the owner of NFT", async function (){
    expect(await global.NFT.ownerOf(0)).to.equal(global.owner)
    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 0) //Use this way because of overriden function
    expect(await global.NFT.ownerOf(0)).to.equal(global.Staking.address)
  })

  it("User should have 1 NFT in staking. Id = 0", async function (){
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(1)
  })

  it("multiplier should be 10 the first time and 11 more after each staking. Id 1,2,3,4", async function (){
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(10)

    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 1)

    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(21)
    
    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 2)

    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(32)

    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 3)
    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 4)
    
    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(54)
  })

  it("user should have 5 NFT in staking", async function(){
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(5)
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

  it("should unstake token at index 0 and receive more gains and multplier should be 11 less", async function(){
    let bal = await global.Ammo.balanceOf(global.owner)
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(54)

    await global.Staking.unstake(0)

    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    let bal2 = await global.Ammo.balanceOf(global.owner)
    multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(numOfStaking).to.equal(4)
    expect(multiplier).to.equal(43)
    expect(bal).to.not.equal(bal2)

  })

  it("should stake one more NFT and claim gains upon staking. Id = 8", async function() {
    let bal = await global.Ammo.balanceOf(global.owner)

    await global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 8)
    
    let bal2 = await global.Ammo.balanceOf(global.owner)  
    expect(bal).to.not.equal(bal2)
  })

  it("Unstake all.Staked number should be be 0 and gains should be claimed.", async function() {
    let bal = await global.Ammo.balanceOf(global.owner)
    
    await global.Staking.unstake(4)
    await global.Staking.unstake(0)
    await global.Staking.unstake(0)
    await global.Staking.unstake(0)
    await global.Staking.unstake(0)

    let bal2 = await global.Ammo.balanceOf(global.owner)
    let numOfStaking = await global.Staking.stakingInfo(global.owner).then(r => r.stakedNftNum)
    expect(numOfStaking).to.equal(0)
    expect(bal).to.not.equal(bal2)
  })


  it("multplier should be 0", async function() {
    let multiplier = await global.Staking.stakingInfo(global.owner).then(r => r.multiplier)
    expect(multiplier).to.equal(0)
  })

  it("user should be able to transfer ERC20", async function() {
    let balAcc = await global.Ammo.balanceOf(global.acc2)
    expect(balAcc).to.equal(0)

    await global.Ammo.transfer(global.acc2, 2 )

    let balAcc2 = await global.Ammo.balanceOf(global.acc2)
    expect(balAcc2).to.equal(balAcc + 2)
  })

  it("owner should be able to burn $AMMO", async function(){
    await expect(global.Ammo.burn(2)).to.not.be.reverted
    
  })

  it("not owner tries to burn $AMMO, it should revert", async function(){
    await expect(global.Ammo.connect(acc2Signer).burn(2)).to.be.revertedWith('only owner')
  })

  it("NFT2 is sent to staking contract, it should fail",async function(){
    await  expect(global.NFT2["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 4)).to.be.revertedWith("wrong contract address")
  })

  it("Acc2 stakes a token from wrong owner. It should fail", async function(){
    await expect(global.NFT["safeTransferFrom(address,address,uint256)"](global.acc2, global.Staking.address, 9)).to.be.revertedWith("TransferFromIncorrectOwner()")
  })

  it("Acc2 stakes a token it doesn't own. It should fail", async function(){
    await expect(global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 15)).to.be.revertedWith("TransferCallerNotOwnerNorApproved()'")
  })

  it("Acc2 stakes a token that doesn't exist. It should fail", async function(){
    await expect(global.NFT["safeTransferFrom(address,address,uint256)"](global.owner, global.Staking.address, 25)).to.be.revertedWith("OwnerQueryForNonexistentToken()")
  })

  it("unstakes a token it doesn't own. It should fail", async function(){
    await expect(global.Staking.unstake(11)).to.be.revertedWith('not owner or staked')
  })
});
