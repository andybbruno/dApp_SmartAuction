House = { 
    // This function let the Auction House to collect its rewards
    collectFees: async () => {
        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            try {
                instance.getFees()
            } catch (error) {
                alert(error)
            }
        })
    },
}