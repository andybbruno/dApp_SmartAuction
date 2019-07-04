Blockchain = {
    // This function simulates the mining of N blocks
    // NOTE: it works only in --> ganache-cli
    simulateBlocks: async () => {
        // Get how many blocks you want to mine
        blocks = $('#blocksToSimulate').val()

        // Then send "blocks" requests to ganache-cli
        for (var i = 0; i <= blocks; i++) {
            new Promise((resolve, reject) => {
                web3.currentProvider.send({
                    jsonrpc: '2.0',
                    // This command will mine a new block
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
                    // This command will increase the time
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