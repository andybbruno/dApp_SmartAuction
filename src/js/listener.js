Listener = {
    eventMap : "",

    listenForEvents: async () => {

        //GANACHE CLI
        var lastBlock

        Listener.eventMap = new Map()

        web3.eth.getBlock('latest', function (error, result) {
            if (!error) {
                lastBlock = result;
            }
        })



        App.contracts.AuctionHouse.deployed().then(function (instance) {
            instance.newAuctionAvailable({}, {
                fromBlock: 0,
                toBlock: lastBlock
                // toBlock: 'latest',
            }).watch(function (error, event) {
                
                Listener.eventMap.set(event.args._address, ["Not yet started", event.args._type])
            })
        })


        // TODO: leggere gli indirizzi delle Auction dalla House
        // e poi per ogni indirizzo usare .at() per 

        var numAuction
        var auctAddress = []

        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            let tmp = await instance.num_auctions()
            numAuction = tmp.toNumber()
        }).then(async () => {
            for (var i = 0; i < numAuction; i++) {
                await App.contracts.AuctionHouse.deployed().then(async (instance) => {
                    let tmp = await instance.auctions.call(i)
                    auctAddress.push(tmp)
                })
            }
        }).then(async () => {
            for (var i = 0; i < auctAddress.length; i++) {
                var category

                await App.contracts.DutchAuction.at(auctAddress[i]).then(async (instance) => {
                    var descr = await instance.description()
                    category = descr[0]
                })

                if (category == "Dutch") {
                    await App.contracts.DutchAuction.at(auctAddress[i]).then(async (instance) => {
                        var tmp = await instance.description()
                        deployBlock = tmp[1] - 1

                        instance.auctionStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Dutch Auction started" , event.address)
                            Listener.eventMap.set(event.address, ["Started", "Dutch"])
                        })

                        
                        instance.auctionValidation({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Dutch Auction in validation" , event.address)
                            Listener.eventMap.set(event.address, ["Validation", "Dutch"])
                        })


                        instance.auctionFinished({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Dutch Auction finished" , event.address)
                            Listener.eventMap.set(event.address, ["Finished", "Dutch"])
                        })
                    })
                }

            }
        }).then(async () => {
            for (var i = 0; i < auctAddress.length; i++) {

                await App.contracts.VickreyAuction.at(auctAddress[i]).then(async (instance) => {
                    var descr = await instance.description();
                    category = descr[0];
                })

                if (category == "Vickrey") {
                    await App.contracts.VickreyAuction.at(auctAddress[i]).then(async (instance) => {
                        var tmp = await instance.description()
                        deployBlock = tmp[1] - 1

                        instance.auctionStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Vickrey Auction started" , event.address)
                            Listener.eventMap.set(event.address, ["Started", "Vickrey"])
                        })

                        instance.withdrawalStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Vickrey Auction withdrawal started" , event.address)
                            Listener.eventMap.set(event.address, ["Withdrawal", "Vickrey"])
                        })

                        instance.openingStarted({}, {
                            fromBlock: deployBlock,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Vickrey Auction opening" , event.address)
                            Listener.eventMap.set(event.address, ["Opening", "Vickrey"])
                        })

                        instance.auctionFinished({}, {
                            fromBlock: 0,
                            toBlock: lastBlock
                            // toBlock: 'latest',
                        }).watch(async (error, event) => {
                            Utils.newToast("Vickrey Auction finished" , event.address)
                            Listener.eventMap.set(event.address, ["Finished", "Vickrey"])
                        })

                    })
                }
            }
        })
    },
}