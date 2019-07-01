pragma solidity ^ 0.5.1;

/// @title Bid contract
/// @author Andrea Bruno 585457
/// @notice This contract helps people in making bids. If deployed locally, no gas is required.
/// @dev The following comments are written using the Solidity NatSpec Format.
contract Bid {
    /// @notice This function generates the nonce and the hash needed in the Vickrey Auction.
    /// @param _bidValue is the desired bid.
    function generate(uint _bidValue) public view returns(uint, bytes32, bytes32) {
        uint value;
        bytes32 nonce;
        bytes32 hash;

        value = _bidValue;
        nonce = keccak256(abi.encodePacked(block.timestamp));
        hash = keccak256(abi.encodePacked(_bidValue, nonce));

        return (value, nonce, hash);
    }
}
