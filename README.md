# Simple Currency Converter with ChainLink

This is a simple web application that uses Chainlink oracle to fetch exchange rates between different currencies. It allows you to convert a value from one currency to another.

## How It Works

1. The web application uses Chainlink oracles to fetch exchange rates between different currencies.

2. Select the source currency and enter the value you want to convert in the input field.

3. Select the target currency from the dropdown.

4. The equivalent value in the target currency will be automatically displayed below the input fields.

5. The conversion is done on-chain using the smart contract deployed on the Ethereum network.

```shell
# Install packages
npm install

# Compile contracts
npx hardhat compile

# Launch tests
npx hardhat test

# Run script deploy
npx hardhat run scripts/deploy.js --network sepolia

# Use frontend in local
cd frontend && npm install && npm run dev
```
