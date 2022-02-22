//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "./ERC/ERC721.sol";
import "./ERC/ERC20.sol";

contract AMMO is ERC20("AMMO", "$AMMO"){

    //address of the staking contract that will mint ERC20 $AMMO
    address public stakingContract;

    /**
    *@param _StakingContract only the staking contract can mint new AMMO $tokens
     */
    constructor(address _StakingContract) {
            stakingContract = address(_StakingContract);
    }

    /**
    *@dev 
     */
    function mint(address _from,uint _amount) external {
        require(_msgSender() == stakingContract);
        _mint(_from, _amount);
    }

}