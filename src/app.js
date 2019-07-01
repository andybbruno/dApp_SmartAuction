App = {
    firstLoading: true,
    contracts: {},
    currentPage: "void",
    house: '0x0',
    seller: '0x1',
    myMap: "",

    // house: '0x3Db54b704b1d24b2828cE650bd21281368339136',
    // seller: '0xDB94Ace4cc749127e3daB35D1815374f2028a147'

    load: async () => {
        var tmpAddress = App.getCookie("address");

        if ((tmpAddress != "") || (tmpAddress != App.activeAccount)) {
            await App.loadWeb3()
            await App.loadAccount()
            await App.loadContract()
            await App.render()
            await App.listenForEvents()
            await App.updateAddress()
            App.setCookie("address", App.activeAccount, 24);
        } else {
            return
        }
    },

    setCookie: function (cname, cvalue, exhours) {
        var d = new Date();
        d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    getCookie: function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({
                    /* ... */
                })
            } catch (error) {
                // User denied account access...
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({
                /* ... */
            })
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async () => {
        // Set the current blockchain account
        App.activeAccount = web3.eth.accounts[0]
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const bid = await $.getJSON('Bid.json')
        App.contracts.Bid = TruffleContract(bid)
        App.contracts.Bid.setProvider(App.web3Provider)

        const aucthouse = await $.getJSON('AuctionHouse.json')
        App.contracts.AuctionHouse = TruffleContract(aucthouse)
        App.contracts.AuctionHouse.setProvider(App.web3Provider)

        const normal = await $.getJSON('NormalStrategy.json')
        App.contracts.NormalStrategy = TruffleContract(normal)
        App.contracts.NormalStrategy.setProvider(App.web3Provider)

        const slow = await $.getJSON('SlowStrategy.json')
        App.contracts.SlowStrategy = TruffleContract(slow)
        App.contracts.SlowStrategy.setProvider(App.web3Provider)

        const fast = await $.getJSON('FastStrategy.json')
        App.contracts.FastStrategy = TruffleContract(fast)
        App.contracts.FastStrategy.setProvider(App.web3Provider)

        const vickrey = await $.getJSON('VickreyAuction.json')
        App.contracts.VickreyAuction = TruffleContract(vickrey)
        App.contracts.VickreyAuction.setProvider(App.web3Provider)

        const dutch = await $.getJSON('DutchAuction.json')
        App.contracts.DutchAuction = TruffleContract(dutch)
        App.contracts.DutchAuction.setProvider(App.web3Provider)

        const auction = await $.getJSON('Auction.json')
        App.contracts.Auction = TruffleContract(auction)
        App.contracts.Auction.setProvider(App.web3Provider)


        // Hydrate the smart contract with values from the blockchain
        App.bid = await App.contracts.Bid.deployed()
        App.aucthouse = await App.contracts.AuctionHouse.deployed()
        App.normal = await App.contracts.NormalStrategy.deployed()
        App.slow = await App.contracts.SlowStrategy.deployed()
        App.fast = await App.contracts.FastStrategy.deployed()

    },

    listenForEvents: async () => {

        //GANACHE CLI
        var lastBlock

        App.myMap = new Map()



        web3.eth.getBlock('latest', function (error, result) {
            if (!error) {
                // console.log(JSON.stringify(result));
                lastBlock = result;
            } else {
                // console.error(error);
            }
        })



        App.contracts.AuctionHouse.deployed().then(function (instance) {
            instance.newAuctionAvailable({}, {
                fromBlock: 0,
                toBlock: lastBlock
                // toBlock: 'latest',
            }).watch(function (error, event) {
                App.myMap.set(event.args._address, ["Not yet started", event.args._type])
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
                await App.contracts.DutchAuction.at(auctAddress[i]).then(function (instance) {
                    instance.auctionStarted({}, {
                        fromBlock: 0,
                        toBlock: lastBlock
                        // toBlock: 'latest',
                    }).watch(async (error, event) => {
                        App.myMap.set(event.address, ["Started", "Dutch"])
                    })
                })
            }
        }).then(async () => {
            for (var i = 0; i < auctAddress.length; i++) {
                await App.contracts.DutchAuction.at(auctAddress[i]).then(function (instance) {
                    instance.auctionValidation({}, {
                        fromBlock: 0,
                        toBlock: lastBlock
                        // toBlock: 'latest',
                    }).watch(async (error, event) => {
                        App.myMap.set(event.address, ["Validation", "Dutch"])
                    })
                })
            }
        }).then(async () => {
            for (var i = 0; i < auctAddress.length; i++) {
                await App.contracts.DutchAuction.at(auctAddress[i]).then(function (instance) {
                    instance.auctionFinished({}, {
                        fromBlock: 0,
                        toBlock: lastBlock
                        // toBlock: 'latest',
                    }).watch(async (error, event) => {
                        App.myMap.set(event.address, ["Finished", "Dutch"])
                    })
                })
            }
        }).finally(async () => {
            for (var [address, [state, kind]] of App.myMap) {
                console.log(address + ' ' + state + ' ' + kind);
                await App.insertEventRow(state,kind,address);
            }
            $('#loadingSpinner').hide()
        })
    },

    insertEventRow: async (status, type, address) => {
        // UPDATE TABLE AUCTIONS
        var tableRef = document.getElementById("eventList");
        // Insert a row at the end of the table
        let newRow = tableRef.insertRow(-1);

        // Insert a cell in the row at index 0
        let newCell1 = newRow.insertCell(0);
        let newCell2 = newRow.insertCell(0);
        let newCell3 = newRow.insertCell(0);


        txt1 = status;
        // Append a text node to the cell
        let newText1 = await document.createTextNode(txt1);

        txt2 = type
        let newText2 = await document.createTextNode(txt2);

        txt3 = address
        let newText3 = await document.createTextNode(txt3);

        await newCell1.appendChild(newText1);
        await newCell2.appendChild(newText2);
        await newCell3.appendChild(newText3);
    },

    render: async () => {
        await App.changePage("homepage")
        $("#account").html(App.activeAccount)

        await App.checkRole();
    },


    checkRole: async () => {
        var active = App.activeAccount.toUpperCase();

        if (active == App.getCookie("house").toUpperCase()) {
            App.activeAccountRole = "House"
            document.getElementById("accountRole").className = "badge badge-primary";
        } else if (active == App.getCookie("seller").toUpperCase()) {
            App.activeAccountRole = "Seller"
            document.getElementById("accountRole").className = "badge badge-danger";
        } else {
            App.activeAccountRole = "Bidder"
            document.getElementById("accountRole").className = "badge badge-success";
        }

        $("#accountRole").html(App.activeAccountRole)



    },

    computeBid: async () => {
        const bidvalue = $('#bidvalue').val();

        App.contracts.Bid.deployed().then(async (instance) => {

            const bid = await instance.generate(bidvalue);
            $('#Hash').html(bid[1]);
            $('#Nonce').html(bid[2]);

            $('#HashNonce').show();

        })
    },

    setAddress: async () => {
        if ($('#houseAdd').val() != "") {
            App.house = $('#houseAdd').val()
            App.setCookie("house", App.house, 24)
        }
        if ($('#sellerAdd').val() != "") {
            App.seller = $('#sellerAdd').val()
            App.setCookie("seller", App.seller, 24)
        }

        await App.updateAddress()
        // await App.changePage("homepage")
        location.reload();
    },

    updateAddress: async () => {
        App.house = App.getCookie("house")
        App.seller = App.getCookie("seller")

        $('#houseTxt').html(App.house)
        $('#sellerTxt').html(App.seller)
    },

    changePage: async (page) => {
        App.currentPage = page
        const address = $('#Address')
        const home = $('#Home')
        const genBid = $('#GenerateBid')
        const dutch = $('#Dutch')
        const vickrey = $('#Vickrey')
        const panel = $('#Panel')
        const simulation = $('#Simulation')

        if (page == "homepage") {
            home.show()
            panel.show()
            simulation.show()
            address.hide()
            genBid.hide()
            dutch.hide()
            vickrey.hide()
        } else if (page == "address") {
            address.show()
            simulation.hide()
            home.hide()
            panel.hide()
            genBid.hide()
            dutch.hide()
            vickrey.hide()
        } else if (page == "bidPage") {
            home.hide()
            panel.hide()
            simulation.hide()
            address.hide()
            genBid.show()
            dutch.hide()
            vickrey.hide()
        } else if (page == "dutchPage") {
            home.hide()
            simulation.hide()
            panel.hide()
            address.hide()
            genBid.hide()
            dutch.show()
            vickrey.hide()
        } else if (page == "vickreyPage") {
            home.hide()
            simulation.hide()
            panel.hide()
            address.hide()
            genBid.hide()
            dutch.hide()
            vickrey.show()
        } else {
            home.hide()
            simulation.hide()
            panel.hide()
            address.hide()
            genBid.hide()
            dutch.hide()
            vickrey.hide()
        }
    },

    newVickrey: async () => {

        const item = $('#itemVick').val()
        const resPrice = $('#resVick').val()
        const minDep = $('#depVick').val()
        const comLen = $('#comVick').val()
        const withLen = $('#withVick').val()
        const openLen = $('#openVick').val()


        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            if (App.activeAccount.toUpperCase() != App.seller.toUpperCase()) {
                const msg = "Please select the right account in Metamask! \nSelected address:\n " + App.activeAccount + " \nSeller:\n " + App.seller;
                alert(msg);
                return;
            }

            try {
                const auct = await instance.newVickrey(
                    item,
                    resPrice,
                    minDep,
                    comLen,
                    withLen,
                    openLen, {
                        from: App.seller,
                        value: 10000000000000000,
                        gas: 5000000
                    }
                );
                alert("AUCTION CORRECTLY CREATED!");
                await App.changePage("homepage")
            } catch (error) {
                alert(error.message);
            }

        })
    },

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
                const auct = await instance.newDutch(
                    item,
                    resPrice,
                    initPrice,
                    selectionAddress, {
                        from: App.seller,
                        value: 10000000000000000,
                        gas: 5000000
                    }
                );
                alert("AUCTION CORRECTLY CREATED!");
                await App.changePage("homepage")
            } catch (error) {
                alert(error.message);
            }
        })

    },

    collectFees: async () => {
        App.contracts.AuctionHouse.deployed().then(async (instance) => {
            try {
                instance.getFees()
            } catch (error) {
                alert(error)
            }
        })
    },

    callContract: async () => {
        const address = $('#addressToCall').val()
        let category

        await App.contracts.Auction.at(address).then(async (instance) => {
            var descr = await instance.description();
            category = descr[0];
        })

        if (category == "Dutch") {
            $("#AuctionUIBodyResponse").load("html/dutch.html");
        } else if (category == "Vickrey") {
            $("#AuctionUIBodyResponse").load("html/vickrey.html");
        } else {
            alert("Auction not recognised!");
        }
    },

    getDescription: async () => {
        const address = $('#addressToCall').val()
        var descr;

        await App.contracts.Auction.at(address).then(async (instance) => {
            descr = await instance.description()
            $("#Description").load("html/description.html", function () {
                $("#categoryDescription").text(descr[0])
                $("#houseDescription").text(descr[1])
                $("#sellerDescription").text(descr[2])
                $("#itemDescription").text(descr[3])
            });

            if (descr[0] == "Dutch") {
                await App.contracts.DutchAuction.at(address).then(async (instance) => {
                    status = await instance.state()

                    if (status == 0) $("#stateDescription").text("GracePeriod")
                    if (status == 1) $("#stateDescription").text("Active")
                    if (status == 2) $("#stateDescription").text("Validating")
                    if (status == 3) $("#stateDescription").text("Finished")

                })
            } else if (descr[0] == "Vickrey") {
                await App.contracts.VickreyAuction.at(address).then(async (instance) => {
                    phase = await instance.phase()

                    if (phase == 0) $("#stateDescription").text("GracePeriod")
                    if (phase == 1) $("#stateDescription").text("Commitment")
                    if (phase == 2) $("#stateDescription").text("Withdrawal")
                    if (phase == 3) $("#stateDescription").text("Opening")
                    if (phase == 4) $("#stateDescription").text("Finished")
                })
            }

        })
    },

    getPhase: async () => {
        const address = $('#addressToCall').val()
        var descr;

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            descr = await instance.phase();

            $("#Description").load("html/phase.html", function () {
                if (descr == 0) $("#phaseDescription").text("Grace Period")
                if (descr == 1) $("#phaseDescription").text("Commitment")
                if (descr == 2) $("#phaseDescription").text("Withdrawal")
                if (descr == 3) $("#phaseDescription").text("Opening")
                if (descr == 4) $("#phaseDescription").text("Finished")
            });
        })
    },

    getActualPrice: async () => {
        const address = $('#addressToCall').val()
        var descr;

        await App.contracts.DutchAuction.at(address).then(async (instance) => {
            descr = await instance.getActualPrice.call()

            $("#Description").load("html/price.html", function () {
                console.log(descr)
                $("#priceDescription").text(descr);
            });

        })
    },

    bidDutch: async () => {
        const address = $('#addressToCall').val()
        const val = $('#etherValue').val()

        console.log(address, ">>>", val)

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

    simulateBlocks: async () => {
        blocks = $('#blocksToSimulate').val()
        for (var i = 0; i <= blocks; i++) {
            new Promise((resolve, reject) => {
                web3.currentProvider.send({
                    jsonrpc: '2.0',
                    method: 'evm_mine',
                    id: new Date().getTime()
                }, (err, result) => {
                    if (err) {
                        return reject(err)
                    }

                    web3.eth.getBlock('latest', function (error, result) {
                        if (!error)
                            console.log(JSON.stringify(result));
                        else {
                            const newBlockHash = result.hash
                            resolve(newBlockHash)
                        }
                    })

                })
            })

            new Promise((resolve, reject) => {
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_increaseTime",
                    params: [3000],
                    id: new Date().getTime()
                }, (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                });
            })
        }
    },


}


$(() => {
    $(window).load(() => {
        App.load()
    })
})


// a = await DutchAuction.at('')