const AuctionHouse = artifacts.require("AuctionHouse");
const Bid = artifacts.require("Bid");
const NormalStrategy = artifacts.require("NormalStrategy");
const FastStrategy = artifacts.require("FastStrategy");
const SlowStrategy = artifacts.require("SlowStrategy");
const DutchAuction = artifacts.require("DutchAuction");
const VickreyAuction = artifacts.require("VickreyAuction");



module.exports = function(deployer) {
  deployer.deploy(AuctionHouse);
  deployer.deploy(Bid);
  deployer.deploy(FastStrategy);
  deployer.deploy(SlowStrategy);
  deployer.deploy(NormalStrategy);
  deployer.deploy(DutchAuction,"0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","AAA",1,2,"0x0000000000000000000000000000000000000000");
  deployer.deploy(VickreyAuction,"0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","AAA",2,2,1,1,1);
};
