// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract CurrencyConverter {
    // Create mapping with price feeds
    mapping(string => AggregatorV3Interface) public dataFeeds;
    mapping(string => bool) public dataFeedsExists;

    address private owner;

    /**
     * Address on Sepolia Network
     */
    constructor() {
        dataFeeds["ETH/USD"] = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        dataFeedsExists["ETH/USD"] = true;

        dataFeeds["BTC/USD"] = AggregatorV3Interface(
            0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        );
        dataFeedsExists["BTC/USD"] = true;

        dataFeeds["BTC/ETH"] = AggregatorV3Interface(
            0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22
        );
        dataFeedsExists["BTC/ETH"] = true;

        dataFeeds["EUR/USD"] = AggregatorV3Interface(
            0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910
        );
        dataFeedsExists["EUR/USD"] = true;

        owner = msg.sender;
    }

    /**
     * Only owner modifier
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Access denied");
        _;
    }

    /**
     * Update datafeed with new address
     */
    function updateDataFeed(string memory _currency, address _newAddress) public onlyOwner {
        require(dataFeedsExists[_currency], "Datafeed not exists");
        dataFeeds[_currency] = AggregatorV3Interface(_newAddress);
    }

    /**
     * Add new datafeed
     */
    function addDataFeed(string memory _currency, address _newAddress) public onlyOwner {
        require(!dataFeedsExists[_currency], "Datafeed just exists");
        dataFeeds[_currency] = AggregatorV3Interface(_newAddress);
        dataFeedsExists[_currency] = true;
    }

    /**
     * Enable datafeed
     */
    function enableDataFeed(string memory _currency) public onlyOwner {
        require(dataFeedsExists[_currency], "Datafeed not exists");
        dataFeedsExists[_currency] = true;
    }

    /**
     * Disable datafeed
     */
    function disableDataFeed(string memory _currency) public onlyOwner {
        require(dataFeedsExists[_currency], "Datafeed not exists");
        dataFeedsExists[_currency] = false;
    }

    /**
     * Returns the latest price and timestamp.
     */
    function getLatestData(string memory _currency) public view returns (int256, uint256) {
        require(dataFeedsExists[_currency], "Datafeed not exists");
        (,int256 price,,uint256 timeStamp,) = dataFeeds[_currency].latestRoundData();
        return (price, timeStamp);
    }

    /**
     * Convert start price and return converted price
     * and last price update timestamp
     */
    function convertCurrency(string memory _currency, uint256 _value) public view returns (uint256, uint256) {
        // Check datafeed exists
        require(dataFeedsExists[_currency], "Datafeed not exists");

        // Get price and timeStamp from Oracle
        (int256 startPrice, uint256 timeStamp) = getLatestData(_currency);

        // Check price > 0
        require(startPrice > 0, "Price feed error");

        // Calc price with decimals
        uint256 price = uint256(startPrice);

        // Get decimals
        uint8 decimals = dataFeeds[_currency].decimals();

        // Convert price
        uint256 convertedPrice = (_value * price) / (10 ** uint256(decimals));

        // Return converted price and timeStamp
        return (convertedPrice, timeStamp);
    }
}
