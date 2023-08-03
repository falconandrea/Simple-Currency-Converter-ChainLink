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

  describe('Tests', function () {
    it('Should deploy', async function () {
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

      const result = await contract.connect(otherAccount).convertCurrency("BTC/DAI", 1)
      expect(Number(result[0])).to.be.equal(1)
    })

    it('Owner should be able to disable a datafeed', async function () {
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
    })
  })
})
