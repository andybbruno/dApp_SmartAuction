Utils = {

    // Given a map <key,value> (in this case <address,event>)
    // then update the table of the auctions
    fillTable: async (map) => {
        map.forEach(async (value, address) => {
            Utils.insertEventRow(value[0], value[1], address);
        })
        $('#loadingSpinner').hide()
    },

    // Given: a status (Started, Finished ....) ,
    // a type (Dtuch / Vickrey) ,
    // and an address (0x0123.....) ,
    // this function will add those info to the auction list
    insertEventRow: async (status, type, address) => {
        var tableRef = document.getElementById("eventList");

        // Insert a row at the end of the table
        let newRow = tableRef.insertRow(-1);

        // Insert a cell in the row at index 0
        let newCell1 = newRow.insertCell(0);
        let newCell2 = newRow.insertCell(0);
        let newCell3 = newRow.insertCell(0);

        txt1 = status;
        let newText1 = await document.createTextNode(txt1);

        txt2 = type
        let newText2 = await document.createTextNode(txt2);

        txt3 = address
        let newText3 = await document.createTextNode(txt3);

        await newCell1.appendChild(newText1);
        await newCell2.appendChild(newText2);
        await newCell3.appendChild(newText3);
    },

    // Given a key, a value and the time in hours,
    // this funcion will set a cookie with the requested value
    setCookie: function (key, value, exhours) {
        var d = new Date();
        d.setTime(d.getTime() + (exhours * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/";
    },

    // Given a key, it retrieve the correspondent value
    getCookie: function (key) {
        var name = key + "=";
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

    // Passing a page name, the function will render the proper page
    changePage: async (page) => {
        
        const address = $('#Address')
        const home = $('#Home')
        const genBid = $('#GenerateBid')
        const dutch = $('#Dutch')
        const vickrey = $('#Vickrey')
        const panel = $('#Panel')
        const simulation = $('#Simulation')



        if (page == "homepage") {
            address.hide()
            simulation.hide()
            home.show()
            panel.show()
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
        }
    },

    // This function checks the role of the current active account (on metamask)
    checkRole: async () => {
        var active = App.activeAccount.toUpperCase();

        if (active == Utils.getCookie("house").toUpperCase()) {
            App.activeAccountRole = "House"
            document.getElementById("accountRole").className = "badge badge-primary";
        } else if (active == Utils.getCookie("seller").toUpperCase()) {
            App.activeAccountRole = "Seller"
            document.getElementById("accountRole").className = "badge badge-danger";
        } else {
            App.activeAccountRole = "Bidder"
            document.getElementById("accountRole").className = "badge badge-success";
        }

        // Update the badge (see top right in homepage)
        $("#accountRole").html(App.activeAccountRole)
    },



    // This function is a tool to help people
    // in making the bids in the Vickrey auction.
    computeBid: async () => {
        const bidvalue = $('#bidvalue').val();

        // Retrieve the contract and then compute the values
        App.contracts.Bid.deployed().then(async (instance) => {

            const bid = await instance.generate(bidvalue);
            $('#Nonce').html(bid[1]);
            $('#Hash').html(bid[2]);

            $('#HashNonce').show();

        })
    },


    // This will update the two big boxes in the homepage
    setAddress: async () => {
        if ($('#houseAdd').val() != "") {
            App.house = $('#houseAdd').val()
            Utils.setCookie("house", App.house, 24)
        }
        if ($('#sellerAdd').val() != "") {
            App.seller = $('#sellerAdd').val()
            Utils.setCookie("seller", App.seller, 24)
        }

        await App.updateAddress()
        location.reload();
    },


    // Given a title and a message,
    // it creates a new toast notification
    newToast: async (title, message) => {

        // Mutex
        if (Utils.toastUnlocked) {
            time = new Date().getTime()

            // Inject this DIV below the #injectToastDiv
            $("#injectToastDiv").append(`
                <div style="min-width: 400px;" id="${time}" class="toast bg-info text-light" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="true" data-delay="7000">
                    <div class="toast-header">
                        <strong class="mr-auto" id="titleEvent">${title}</strong>
                        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                        </button>
                    </div>
                    <div class="toast-body" id="textEvent">
                        ${message}
                    </div>
                </div>
            `);
            $("#" + time).toast("show")
            setInterval(() => {
                $("#" + time).remove();
            }, 7000);
        }
    },
}

