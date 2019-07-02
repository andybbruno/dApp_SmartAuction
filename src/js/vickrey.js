Vickrey = {
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
                var auct = await instance.newVickrey(
                    item,
                    resPrice,
                    minDep,
                    comLen,
                    withLen,
                    openLen, {
                        value: 10000000000000000,
                    }
                );
                Utils.changePage("homepage")
                Utils.newToast("Vickrey Auction correctly created!", "See the list for more details...")
            } catch (error) {
                alert(error.message);
            }

        })
    },

    getPhase: async () => {
        const address = $('#addressToCall').val()
        var phase;

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            phase = await instance.phase();

            $("#Description").load("html/phase.html", function () {
                if (phase == 0) $("#phaseDescription").text("Grace Period")
                if (phase == 1) $("#phaseDescription").text("Commitment")
                if (phase == 2) $("#phaseDescription").text("Withdrawal")
                if (phase == 3) $("#phaseDescription").text("Opening")
                if (phase == 4) $("#phaseDescription").text("Finished")
            });
        })
    },

    getMinDeposit: async () => {
        const address = $('#addressToCall').val()
        var deposit;

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            deposit = await instance.min_deposit()
            deposit = deposit.toNumber()

            $("#Description").load("html/mindeposit.html", function () {
                $("#minDeposit").text(deposit);
            });

        })
    },

    activateVickreyAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.activateAuction()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    startWithdrawalVickreyAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.startWithdrawal()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    startOpeningVickreyAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.startOpening()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    finalizeVickreyAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.finalize()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    bidVickreyAuction: async () => {
        const address = $('#addressToCall').val()
        const val = $('#bidValueVickrey').val()
        const hash = $('#hashVickrey').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.bid(hash, {
                    value: val
                })
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    withdrawVickreyAuction: async () => {
        const address = $('#addressToCall').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.withdrawal()
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },

    openVickreyAuction: async () => {
        const address = $('#addressToCall').val()
        const val = $('#openValueVickrey').val()
        const nonce = $('#nonceVickrey').val()

        await App.contracts.VickreyAuction.at(address).then(async (instance) => {
            try {
                await instance.open(nonce, {
                    value: val
                })
            } catch (error) {
                alert("Something went wrong!")
            }
        })
    },
}