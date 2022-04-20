//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./ERC/ERC721.sol";
import "./ERC/ERC20.sol";

contract AMMO is ERC20("AMMO", "$AMMO"){

    //address of the staking contract that will mint ERC20 $AMMO
    address public stakingContract;

    /**
    *@param _stakingContract only the staking contract can mint new AMMO $tokens
     */
    constructor(address _stakingContract) {
            stakingContract = address(_stakingContract);
    }

    /**
    *@dev 
     */
    function mint(address _from,uint _amount) external {
        require(_msgSender() == stakingContract, "wrong contract address");
        _mint(_from, _amount);
    }

}