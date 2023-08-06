const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { expect } = require('chai')
const hre = require('hardhat')
require('dotenv').config()

describe('MockCurrencyConverter', function () {
  async function deployFixture () {
    const [owner, otherAccount] = await hre.ethers.getSigners()

    const Contract = await hre.ethers.getContractFactory('MockCurrencyConverter')
    const contract = await Contract.deploy()

    await contract.waitForDeployment()

    return { contract, owner, otherAccount }
  }

  describe('Deploy contract', function () {
    it('Should deploy correctly', async function () {
      const { contract } = await loadFixture(deployFixture)

      expect(contract.target).to.be.a('string')
    })
  })

  describe('Owner actions', function () {
    it('Owner should be able to add new datafeed', async function () {
      const { contract, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(contract.connect(otherAccount)
        .addDataFeed("BTC/DAI", otherAccount.address))
        .to.be.revertedWith('Access denied')

      await expect(contract.connect(owner)
        .addDataFeed("BTC/DAI", owner.address))
        .to.be.not.reverted

      const result = await contract.connect(otherAccount)
        .convertCurrency("BTC/DAI", 1)
      expect(Number(result[0])).to.be.equal(1000000000000000000)
    })

    it('Owner should be able to disable and re-enable a datafeed', async function () {
      const { contract, owner, otherAccount } = await loadFixture(deployFixture)

      await expect(contract.connect(otherAccount)
        .disableDataFeed("ETH/USD"))
        .to.be.revertedWith('Access denied')

      await expect(contract.connect(owner)
        .disableDataFeed("ETH/USD"))
        .to.be.not.reverted

      await expect(contract.connect(otherAccount)
        .convertCurrency("ETH/USD", 1))
        .to.be.revertedWith('Datafeed not exists')

      let statusFeed = await contract.connect(otherAccount)
        .getStatus("ETH/USD")
      expect(statusFeed).to.be.false

      await expect(contract.connect(owner)
        .addDataFeed("ETH/USD", "0x694AA1769357215DE4FAC081bf1f309aDC325306"))
        .to.be.not.reverted

      await expect(contract.connect(otherAccount)
        .convertCurrency("ETH/USD", 1))
        .to.be.not.reverted

      statusFeed = await contract.connect(otherAccount)
        .getStatus("ETH/USD")
      expect(statusFeed).to.be.true
    })
  })

  describe('User actions', function () {
    it('User should be able to use datafeed', async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture)

      const convertedValue = await contract.connect(otherAccount)
        .convertCurrency("ETH/USD", 1)
      expect(Number(convertedValue[0])).to.be.equal(1000000000000000000)
    })
  })
})
