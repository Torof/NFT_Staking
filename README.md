# Bridging and Staking on polygon network

__Bridging__

The contract is already deployed on ETH mainnet at 0x97a923ed35351a1382E6bcbB5239fc8d93360085
https://etherscan.io/address/0x97a923ed35351a1382e6bcbb5239fc8d93360085

_To interact with the contract on polygon a mapping requests needs to be made at https://mapper.polygon.technology/map_
¤ It requires:
-The rootToken address (on ETH mainnet: 0x97a923ed35351a1382E6bcbB5239fc8d93360085) and the contract to be verified
-The childToken address (on Polygon mainnet, accessible after deployment) and the contract to be verified.
-That the child contracts implements the "deposit" and withdraw functions. (they are defined defined in the contract)
-That the childChainManagerProxy address be registered as the only one able to call the deposit function. (Done with constructor and accessControl)
-That the child contract has a _mint() function defined as internal that will be used by the "deposit" function.

_Once the mapping request has been approved, users can bridge their NFTs. The best way to do it is using Matic SDK_

See the official docs at https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/getting-started
Matic SDK: https://maticnetwork.github.io/matic.js/docs/get-started

¤Steps of bridging: (can be done on front end with matic SDK)

ETH=>Polygon  
-User needs to approve predicate contract (See https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/using-sdk/erc721#approve)
-User deposits its NFT and wait 3 to 7 minutes. (See https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/using-sdk/erc721#deposit)
__- !WARNING! Only childChainManagerProxy should have the rights to call the deposit function__

Polygon=>ETH
-User calls burn function. (See https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/using-sdk/erc721#burn)
-User calls exit function. (See https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/using-sdk/erc721#exit)


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
    ¤Bridge NFT from ETH to Polygon
    ¤Send NFT with safeTransferFrom() to staking Contract. _Staking contract will only accept NFT from registered contract_.
    ___WARNING: BE SURE TO USE safeTransferFrom() AND NOT transferFrom()__

-To unstake an NFT:
    ¤Simply call unstake() function from Staking contract.

-To claim earned gains:
    ¤Call claim() from Staking contract.
    ¤Staking a new NFT will automatically claim gains.
    ¤Unstaking a NFT will automatically claim gains.


# Deploy


To deploy the contracts on polygon you need to make sure that all needed informations are provided and correct.
In this project, create a file named .env, and then edit it to fill in the details. Enter:
    ¤ Your Polygonscan api key
    ¤ Your provider Polygon url (eg on Alchemy or Infura)
    ¤ The private key of the contract that will deploy the contract and establish ownership. Make sure to use the same address that was used for the ETH mainnet deployment.

In the deploy script (under scripts/deploy.js)make sure to have initiated the variables that will be used in the constructor of the newly deployed contracts:
    ¤ChildChainManagerProxy address (the address of the proxy contract that will manage the deposit function)
    =>  See https://polygonscan.com/address/0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa/#code 
            https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/deployment/
    ¤ERC721 token name 
    ¤ERC721 token symbol
    ¤Reward speed (The number that will decide the base daily generation of ERC20 by staking)

All Polygon deployment details can be found here: https://docs.polygon.technology/docs/develop/ethereum-polygon/pos/deployment/

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
