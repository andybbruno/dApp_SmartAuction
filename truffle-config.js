const HDWalletProvider = require('truffle-hdwallet-provider'); // install it with npm
const infuraKey = "YOUR INFURA KEY"; // Keep it secret
const mnemonic = "bla bla bla .........";


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },

    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },

    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraKey}`),
      network_id: 3, // Ropsten's id
      gas: 6000000, // Ropsten has a lower block limit than mainnet
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
