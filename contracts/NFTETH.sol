// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./ERC/ERC721Enumerable.sol";

contract NFTETH is ERC721Enumerable {
  
  constructor () ERC721("Champions", "CHAMPS") {
    
  }
  function mint() external {
      uint tokenId;
      while(_exists(tokenId)) tokenId++;
      _safeMint(msg.sender, tokenId);
  }


}
