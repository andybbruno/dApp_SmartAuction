Contract = {
    interact: async () => {
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
                $("#houseDescription").text(descr[2])
                $("#sellerDescription").text(descr[3])
                $("#itemDescription").text(descr[4])
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
}