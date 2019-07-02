Blockchain = {
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