Dutch = {

    // This function will create a new Dutch auction
    newDutch: async () => {

        // Retrieve data from the UI
        const item = $('#itemDutch').val()
        const resPrice = $('#resDutch').val()
        const initPrice = $('#initDutch').val()
        const selection = $('#selDutch').val()
        var selectionAddress

        // Get the selected Strategy
        if (selection == "slow") {
            selectionAddress = App.slow.address
        } else if (selection == "fast") {
            selectionAddress = App.fast.address
        } else {
            selectionAddress = App.normal.address
        }

        // Try to create a new contract by calling the function 'newDutch()' in the AuctionHouse
        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            // If the current account on metamask is not the seller 
            // then send an alert and return
            if (App.activeAccount.toUpperCase() != App.seller.toUpperCase()) {
                const msg = "Please select the right account in Metamask or change the seller address! \nSelected address:\n " + App.activeAccount + " \nSeller:\n " + App.seller;
                alert(msg);
                return;
            }

            // call 'newDutch()' in AuctionHouse by sending 0.01 ETH
            try {
                await instance.newDutch(
                    item,
                    resPrice,
                    initPrice,
                    selectionAddress, {
                        value: 10000000000000000,
                    }
                );
                // Once finished, return in the homepage and send a notification
                Utils.changePage("homepage")
                Utils.newToast("Dutch Auction correctly created!", "See the list for more details...")
            } catch (error) {
                alert(error.message);
            }
        })

    },


    // Contact the Dutch contract to get the actual price
    getActualPrice: async () => {
        const address = $('#addressToCall').val()
        var price;

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            price = await instance.getActualPrice.call()

            // Inject HTML
            $("#Description").load("html/price.html", function () {
                $("#priceDescription").text(price);
            });

        })
    },

    // Send a bid to a Dutch auction
    bidDutch: async () => {

        // Retrieve the bid
        const address = $('#addressToCall').val()
        const val = $('#etherValue').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            try {
                // Send the bid and the value as described in the contract
                await instance.bid({
                    value: val
                })
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },


    // Try to activate the auction
    activateDutchAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            // NOTE: the contract will ensure that the caller is the Auction House!
            try {
                await instance.activateAuction()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    
    // Try to activate the auction
    finalizeDutchAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            // NOTE: the contract will ensure that the caller is the Auction House!
            try {
                await instance.finalize()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },
}

