Vickrey = {

    // This function will create a new Vickrey auction
   newVickrey: async () => {

       // Retrieve data from the UI
       const item = $('#itemVick').val()
       const resPrice = $('#resVick').val()
       const minDep = $('#depVick').val()
       const comLen = $('#comVick').val()
       const withLen = $('#withVick').val()
       const openLen = $('#openVick').val()

       // Try to create a new contract by calling the function 'newVickrey()' in the AuctionHouse
       App.contracts.AuctionHouse.deployed().then(async (instance) => {
           // If the current account on metamask is not the seller 
           // then send an alert and return
           if (App.activeAccount.toUpperCase() != App.seller.toUpperCase()) {
               const msg = "Please select the right account in Metamask! \nSelected address:\n " + App.activeAccount + " \nSeller:\n " + App.seller;
               alert(msg);
               return;
           }

           // call 'newVickrey()' in AuctionHouse by sending 0.01 ETH
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
               // Once finished, return in the homepage and send a notification
               Utils.changePage("homepage")
               Utils.newToast("Vickrey Auction correctly created!", "See the list for more details...")
           } catch (error) {
               alert(error.message);
           }

       })
   },


   // This function will udpate the actual phase in the description of the Vickrey UI
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


   // This function will udpate the minimum deposit in the description of the Vickrey UI
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


   // Try to activate the auction
   activateVickreyAuction: async () => {
       const address = $('#addressToCall').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           // NOTE: the contract will ensure that the caller is the Auction House!
           try {
               await instance.activateAuction()
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },


   // Try to start the withdrawal period
   startWithdrawalVickreyAuction: async () => {
       const address = $('#addressToCall').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           // NOTE: the contract will ensure that the caller is the Auction House!
           try {
               await instance.startWithdrawal()
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },

   // Try to start the opening period   
   startOpeningVickreyAuction: async () => {
       const address = $('#addressToCall').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           // NOTE: the contract will ensure that the caller is the Auction House!
           try {
               await instance.startOpening()
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },

   // Try to finalize the auction
   finalizeVickreyAuction: async () => {
       const address = $('#addressToCall').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           // NOTE: the contract will ensure that the caller is the Auction House!
           try {
               await instance.finalize()
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },

   // This function will make a bid to a Vickrey contract
   bidVickreyAuction: async () => {

       // Retrieve the values from the UI
       const address = $('#addressToCall').val()
       const val = $('#bidValueVickrey').val()
       const hash = $('#hashVickrey').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           try {
               // Send the bid and the value as described in the contract
               await instance.bid(hash, {
                   value: val
               })
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },


   // This function allow to withdraw a bid
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


   // Try to open your bid
   openVickreyAuction: async () => {
       const address = $('#addressToCall').val()
       const val = $('#openValueVickrey').val()
       const nonce = $('#nonceVickrey').val()

       await App.contracts.VickreyAuction.at(address).then(async (instance) => {
           try {
               // send the nonce and the value as described in the contract
               await instance.open(nonce, {
                   value: val
               })
           } catch (error) {
               alert("Something went wrong!")
           }
       })
   },
}

