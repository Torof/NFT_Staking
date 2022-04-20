# Staking on ETH network



__Staking__
The contract that will be in custody of user's NFT and stake it.

-The contract will automatically stake an NFT in the name of a user upon reception.
   => The contract is in custody of a user's NFTs but the user retains full ownership of them (through ownerOf mapping)
   and can claim its rewards and unstake/withdraw a NFT at any time to receive it back into its wallet.

-Creation (minting) of ERC20 ($AMMO) will be issued on:
     ¤ staking of one more NFT from the user.
     ¤ unstaking one the NFT currently in staking from the user.
     ¤ calling of the the claim() function.

All those interactions are implemented in the contract but they need to be connected to a web3 library for front end interaction.

-To stake an NFT:
    ¤Send NFT with safeTransferFrom() to staking Contract. _Staking contract will only accept NFT from registered contract_.
    ___WARNING: BE SURE TO USE safeTransferFrom() AND NOT transferFrom()__

-To unstake an NFT:
    ¤Simply call unstake() function from Staking contract.

-To claim earned gains:
    ¤Call claim() from Staking contract.
    ¤Staking a new NFT will automatically claim gains.
    ¤Unstaking a NFT will automatically claim gains.

-To check how many NFTs a user has in staking and which NFT ids the user is staking use stakingInfo.stakedNftNum and the tokenIds mapping for enumeration. 


# Deploy


To deploy the contracts on polygon you need to make sure that all needed informations are provided and correct.
In this project, create a file named .env, and then edit it to fill in the details. Enter:
    ¤ Your Ethercan api key
    ¤ Your provider ETH url (eg on Alchemy or Infura)
    ¤ The private key of the contract that will deploy the contract and establish ownership. Make sure to use the same address that was used for the ETH mainnet deployment.

In the deploy script (under scripts/deploy.js)make sure to have initiated the variables that will be used in the constructor of the newly deployed contracts:
    ¤ERC721 token name 
    ¤ERC721 token symbol
    ¤Reward speed (The number that will decide the base daily generation of ERC20 by staking)


With a valid environment you can then deploy the contracts:

```shell

npx hardhat run --network polygon scripts/deploy.js

```

# Verify
Reference here: https://github.com/NomicFoundation/hardhat/tree/master/packages/hardhat-etherscan

To  be verified you first need an API key from Polygonscan.
Make sure to secretly import it in your hardhat.config file.

Make sure your contract is already deployed before verifying.

then run: 

```shell

$ npx hardhat verify --network polygon "YOUR_DEPLOYED_CONTRACT_ADDRESS" "CONSTRUCTOR_ARGUMENTS"

```
See here for complex arguments: https://github.com/NomicFoundation/hardhat/tree/master/packages/hardhat-etherscan#complex-arguments

# Test

test can be found at scripts/test

This should be added to "contracts/NFTPOLYGON.sol" for testing and removed before deployment:

    ```function mint() external {
        _safeMint(msg.sender, totalSupply());//TODO: remove after testing
    }```

```shell
 npx hardhat test

```

# Advanced Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.


Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten or Goerli.

In this project, create a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten, Goerli ... node URL (eg from Alchemy or Infura), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS "YOUR_ARGUMENT"
```
