Dutch = {
    newDutch: async () => {

        const item = $('#itemDutch').val()
        const resPrice = $('#resDutch').val()
        const initPrice = $('#initDutch').val()
        const selection = $('#selDutch').val()
        var selectionAddress

        if (selection == "slow") {
            selectionAddress = App.slow.address
        } else if (selection == "fast") {
            selectionAddress = App.fast.address
        } else {
            selectionAddress = App.normal.address
        }

        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            if (App.activeAccount.toUpperCase() != App.seller.toUpperCase()) {
                const msg = "Please select the right account in Metamask or change the seller address! \nSelected address:\n " + App.activeAccount + " \nSeller:\n " + App.seller;
                alert(msg);
                return;
            }

            try {
                await instance.newDutch(
                    item,
                    resPrice,
                    initPrice,
                    selectionAddress, {
                        value: 10000000000000000,
                    }
                );
                Utils.changePage("homepage")
                Utils.newToast("Dutch Auction correctly created!", "See the list for more details...")
            } catch (error) {
                alert(error.message);
            }
        })

    },

    getActualPrice: async () => {
        const address = $('#addressToCall').val()
        var price;

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            price = await instance.getActualPrice.call()

            $("#Description").load("html/price.html", function () {
                $("#priceDescription").text(price);
            });

        })
    },

    bidDutch: async () => {
        const address = $('#addressToCall').val()
        const val = $('#etherValue').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            try {
                await instance.bid({
                    value: val
                })
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    activateDutchAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            try {
                await instance.activateAuction()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    finalizeDutchAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            try {
                await instance.finalize()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },
}