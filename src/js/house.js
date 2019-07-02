House = { 
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