pragma solidity ^ 0.5.1;

import "./DutchAuction.sol";
import "./VickreyAuction.sol";

/// @title Auction House contract
/// @author Andrea Bruno 585457

/// @notice This contract implements the shared functionalities between the Dutch and Vickrey auction.
/// @dev The following comments are written using the Solidity NatSpec Format.


contract AuctionHouse {
    
    uint fees = 0.01 ether;
    
    address[] public auctions;
    uint public num_auctions;

    address payable houseOwner;
    
    event newAuctionAvailable(string _type, address _address);
    
    constructor() public {
        houseOwner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == houseOwner);
        _;
    }

    modifier payFees() {
        require(msg.value == fees, "Please send a correct value");
        _;
    }

    function newDutch(
        string memory _itemName,
        uint _reservePrice,
        uint _initialPrice,
        Strategy _strategy
    ) public payable payFees{
        DutchAuction dutch = new DutchAuction(houseOwner, msg.sender, _itemName, _reservePrice, _initialPrice, _strategy);
        auctions.push(address(dutch));
        num_auctions += 1;
        emit newAuctionAvailable("Dutch", address(dutch));
    }
    // ******** TEST **********
    // house = await AuctionHouse.deployed()
    // slow = await SlowStrategy.deployed()
    // accounts = await web3.eth.getAccounts()
    // house.newDutch('XXX',100,100, slow.address, {value: 10000000000000000, from: accounts[0]})


    
    
    function newVickrey(
        string memory _itemName,
        uint _reservePrice,
        uint _min_deposit,
        uint _commitment_len,
        uint _withdrawal_len,
        uint _opening_len
    )  public payable payFees{
        VickreyAuction vickrey = new VickreyAuction(houseOwner, msg.sender, _itemName, _reservePrice, _min_deposit, _commitment_len, _withdrawal_len, _opening_len);
        auctions.push(address(vickrey));
        num_auctions += 1;
        emit newAuctionAvailable("Vickrey", address(vickrey));
    }
    // ******** TEST **********
    // house = await AuctionHouse.deployed()
    // accounts = await web3.eth.getAccounts()
    // house.newVickrey('aaa',100,100,10,10,10, {value: 10000000000000000, from: accounts[0]})


    function getFees () public onlyOwner {
        houseOwner.transfer(address(this).balance);
    }
}
