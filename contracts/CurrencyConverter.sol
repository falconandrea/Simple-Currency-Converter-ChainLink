// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "hardhat/console.sol";

contract CurrencyConverter {
    AggregatorV3Interface internal dataFeed;

    /**
     * Network: Sepolia
     * Aggregator: ETH/USD
     * Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306
     */
    constructor() {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
    }

    /**
     * Change datafeed with new address
     */
    function changeDataFeed(address _newAddress) public {
        dataFeed = AggregatorV3Interface(_newAddress);
    }

    /**
     * Returns the latest answer.
     */
    function getLatestData() public view returns (int256, uint256) {
        (,int256 answer,,uint256 timeStamp,) = dataFeed.latestRoundData();
        return (answer, timeStamp);
    }

    /**
     * Convert start price and return converted price
     * and last price update timestamp
     */
    function convertCurrency(uint256 _value) public view returns (uint256, uint256) {
        // Get price and timeStamp from Oracle
        (int256 startPrice, uint256 timeStamp) = getLatestData();

        // Check price > 0
        require(startPrice > 0, "Price feed error");

        // Calc price with decimals
        uint256 price = uint256(startPrice);

        // Get decimals
        uint8 decimals = dataFeed.decimals();

        // Convert price
        uint256 convertedPrice = (_value * price) / (10 ** uint256(decimals));

        // Return converted price and timeStamp
        return (convertedPrice, timeStamp);
    }
}
