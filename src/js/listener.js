Listener = {
    // This is a <key, value> map
    eventMap: "",

    listenForEvents: async () => {

        // Create the map.
        // NOTE: I use a map because for each contract, each listeners will return all the events that the contract has emitted until now.
        // So, I push into the map <contract_address, event> , this way, at the end of this function, every address will have only the last event.
        Listener.eventMap = new Map()

        var lastBlock

        // Set the last block to web3
        web3.eth.getBlock('latest', function (error, result) {
            if (!error) {
                lastBlock = result;
            }
        })

        // From the AuctionHouse retrieve the event 'newAuctionAvailable'
        // Remember that, when a contract is created is not active, but in Grace Period
        App.contracts.AuctionHouse.deployed().then(function (instance) {
            instance.newAuctionAvailable({}, {
                fromBlock: 0,
                toBlock: lastBlock
                // toBlock: 'latest',
            }).watch(function (error, event) {
                // Push the event to the map
                Listener.eventMap.set(event.args._address, ["Not yet started", event.args._type])
            })
        })



        // In the Auction House, every new contract instance is stored inside an array. 
        // Unfortunately, in Solidity, there is no way to allow a function return an array, 
        // thus although the data structure is public, the only way to retrieve data is a manual iteration.

        var numAuction
        var auctAddress = []

        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            // Retrieve the number of contracts created until now
            let tmp = await instance.num_auctions()
            numAuction = tmp.toNumber()
        }).then(async () => {
            // For each contract get its own address
            for (var i = 0; i < numAuction; i++) {
                await App.contracts.AuctionHouse.deployed().then(async (instance) => {
                    let tmp = await instance.auctions.call(i)
                    auctAddress.push(tmp)
                })
            }
        }).then(async () => {
            // Then for each address
            for (var i = 0; i < auctAddress.length; i++) {
                var category

                // Try to instantiate a Dutch auction
                await App.contracts.DutchAuction.at(auctAddress[i]).then(async (instance) => {
                    var descr = await instance.description()
                    category = descr[0]
                })

                // If it is an actual Dutch
                if (category == "Dutch") {
                    await App.contracts.DutchAuction.at(auctAddress[i]).then(async (instance) => {
                        var tmp = await instance.description()
                        deployBlock = tmp[1] - 1

                        // listen for the event 'auctionStarted'
                        instance.auctionStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Dutch Auction started", event.address)
                            Listener.eventMap.set(event.address, ["Started", "Dutch"])
                        })


                        // listen for the event 'auctionValidation'
                        instance.auctionValidation({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Dutch Auction in validation", event.address)
                            Listener.eventMap.set(event.address, ["Validation", "Dutch"])
                        })

                        // listen for the event 'auctionFinished'
                        instance.auctionFinished({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Dutch Auction finished", event.address)
                            Listener.eventMap.set(event.address, ["Finished", "Dutch"])
                        })
                    })
                }

            }
        }).then(async () => {
            // For each address
            for (var i = 0; i < auctAddress.length; i++) {

                // Try to instantiate a Vickrey auction
                await App.contracts.VickreyAuction.at(auctAddress[i]).then(async (instance) => {
                    var descr = await instance.description();
                    category = descr[0];
                })

                // If it is an actual Vickrey
                if (category == "Vickrey") {
                    await App.contracts.VickreyAuction.at(auctAddress[i]).then(async (instance) => {
                        var tmp = await instance.description()
                        deployBlock = tmp[1] - 1

                        // listen for the event 'auctionStarted'
                        instance.auctionStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Vickrey Auction started", event.address)
                            Listener.eventMap.set(event.address, ["Started", "Vickrey"])
                        })


                        // listen for the event 'withdrawalStarted'
                        instance.withdrawalStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Vickrey Auction withdrawal started", event.address)
                            Listener.eventMap.set(event.address, ["Withdrawal", "Vickrey"])
                        })


                        // listen for the event 'openingStarted'
                        instance.openingStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Vickrey Auction opening", event.address)
                            Listener.eventMap.set(event.address, ["Opening", "Vickrey"])
                        })


                        // listen for the event 'auctionFinished'
                        instance.auctionFinished({}, {
                            fromBlock: 0,
                            toBlock: lastBlock
                        }).watch(async (error, event) => {
                            // then notify the event
                            Utils.newToast("Vickrey Auction finished", event.address)
                            Listener.eventMap.set(event.address, ["Finished", "Vickrey"])
                        })

                    })
                }
            }
        })
    },
}