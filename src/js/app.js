App = {
    firstLoading: true,
    contracts: {},
    currentPage: "void",
    house: '0x0',
    seller: '0x1',

    load: async () => {
        var tmpAddress = Utils.getCookie("address");

        if ((tmpAddress != "") || (tmpAddress != App.activeAccount)) {
            await App.loadWeb3()
            await App.loadAccount()
            await App.loadContract()
            await App.render()
            await App.updateAddress()
            await Listener.listenForEvents()
            Utils.setCookie("address", App.activeAccount, 24);
        } else {
            return
        }
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

    render: async () => {
        $("#account").html(App.activeAccount)
        await Utils.checkRole();
    },

    updateAddress: async () => {
        App.house = Utils.getCookie("house")
        App.seller = Utils.getCookie("seller")

        $('#houseTxt').html(App.house)
        $('#sellerTxt').html(App.seller)
    },
}


$(() => {
    $(window).load(() => {
        App.load()
    })

    $(window).ready(() => {
        //UPDATE CONTRACT TABLE

        var first = true
        setInterval(function () {
            if (!first) {
                var tableRef = document.getElementById("eventList");

                for (var i = tableRef.rows.length - 1; i > 0; i--) {
                    tableRef.deleteRow(i);
                }
            }
            Utils.fillTable(Listener.eventMap)
            Utils.toastUnlocked = true
            first = false
        }, 4000);

        Utils.toastUnlocked = true
        Utils.newToast("Welcome", "Here we will notify new events!")
        Utils.toastUnlocked = false
    })
})