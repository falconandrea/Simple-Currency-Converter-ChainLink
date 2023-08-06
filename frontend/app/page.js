"use client";

import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
import contract from "./../../artifacts/contracts/CurrencyConverter.sol/CurrencyConverter.json"
const abi = contract.abi
const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID

const addresses = {
  "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  "BTC/USD": "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
  "BTC/ETH": "0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22",
  "EUR/USD": "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910"
}

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();
  // for messages
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Start price to convert
  const [amount, setAmount] = useState(0)
  // Converted price
  const [convertedAmount, setConvertedAmount] = useState(0)
  // Timestamp last price update
  const [timestamp, setTimestamp] = useState(null)
  // Currenct currency selected
  const [currency, setCurrency] = useState("ETH/USD")

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (parseInt(chainId) !== parseInt(NETWORK_ID)) {
      setErrorMessage(`Change the network to ${NETWORK_NAME}`);
      throw new Error(`Change the network to ${NETWORK_NAME}`);
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: NETWORK_NAME,
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet()
    }
  }, [walletConnected]);

  function convertTimestampToDateTime(timestamp) {
    const date = new Date(timestamp);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
      timeZone: 'UTC'
    };
    return date.toLocaleString('en-US', options);
  }

  const convert = async () => {
    setLoading(true)
    const signer = await getProviderOrSigner(true)
    const contract = new Contract(CONTRACT_ADDRESS, abi, signer)
    const result = await contract.convertCurrency(currency, amount)
    setConvertedAmount(Number(result[0]) / (10 ** Number(result[1])))
    const timestamp = Number(result[2])
    // Convert timestamp to date with format dd-mm-yyyy GMT time
    const date = new Date(timestamp * 1000)
    setTimestamp(convertTimestampToDateTime(date))
    setLoading(false)
  }

  const changeFeed = async (currencySelected) => {
    if(addresses[currencySelected]) {
      setCurrency(currencySelected)
    }
  }

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button className="w-full bg-indigo-600 text-white py-2 rounded-md" onClick={connectWallet}>
          Connect your wallet
        </button>
      );
    } else {
      return (
        <button className="w-full bg-indigo-600 text-white py-2 rounded-md" onClick={convert}>Convert</button>
      );
    }
  };

  const renderMessages = () => {
    if (successMessage) {
      return (
        <p className="text-green-500 mt-5 mb-5">
          {successMessage}
        </p>
      )
    }
    if (errorMessage) {
      return (
        <p className="text-red-500 mt-5 mb-5">
          {errorMessage}
        </p>
      )
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Currency Converter</title>
        <meta name="description" content="Currency Converter" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {loading ? (
          <div className="loading">
            <p>Loading...</p>
          </div>
        ) : ''}
        <div className="container mx-auto p-4 pt-8">
          <h1 className="text-3xl font-semibold text-center mb-2">Currency Converter</h1>
          <h4 className="text-md text-center mb-8">Using Chainlink Price Feed</h4>
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
              <input type="number" id="amount" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
            </div>
            <div className="mb-4">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency Exchange</label>
              <select id="currency" name="currency" value={currency} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200" onChange={(e) => changeFeed(e.target.value)}>
                {Object.keys(addresses).map((address, index) => (
                  <option key={index} value={address}>{address}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="convertedAmount" className="block text-sm font-medium text-gray-700">Converted Amount</label>
              <input type="text" id="convertedAmount" name="convertedAmount" value={convertedAmount} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200" readOnly />
            </div>
            { timestamp ? (
              <p className="mb-4"><small>Price updated at {timestamp}</small></p>
            ) : ''}
            {renderMessages()}
            {renderButton()}
          </div>
        </div>
      </div>

      <footer className="text-center">Created by Falcon Andrea</footer>
    </div>
  )
}
