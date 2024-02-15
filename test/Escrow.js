const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer, seller, inspector, lender

    beforeEach(async () => {
        [buyer, seller, inspector, lender] =await ethers.getSigners()


        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        //mint
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()
        console.log(realEstate.address)

        Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )
        //approve transaction
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()
        //list property
        transaction =await escrow.connect(seller).list(1)
        await transaction.wait()


    })

    describe ('deployment', () => {
        
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })
        it("Returns seller", async () => {
            const  result = await escrow.seller()
    
            expect(result).to.be.equal(seller.address)
        })
    })

    describe("listing", () => {
        it ("update ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

})
