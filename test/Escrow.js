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
        transaction =await escrow.connect(seller).list(1,tokens(10), buyer.address, tokens(5))
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

    describe('listing', () => {
        it ("update ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
            expect(await escrow.islisted(1)).to.be.equal(true)
        })
        it ("returns price", async () => {
            expect(await escrow.purchasePrice(1)).to.be.equal(tokens(10))
        })
        it ("Return buyer", async () => {
            expect(await escrow.buyer(1)).to.be.equal(buyer.address)
        })
        it ("Returns escrow amount" , async () => {
            expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5))
        })
    })

    
    describe("down payment", () => {
        it ("returns down payment", async () => {
            transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5)})
            await transaction.wait()
            expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5))
        })
    })
    
    describe("inpection passed", () => {
        it("inspection status", async () => {
            transaction = await escrow.connect(inspector).passedInspection(1, true)
            await transaction.wait()
            expect(await escrow.inspectionPassed(1)).to.be.equal(true)

        })

    })
    
    
    describe("approval passed", () => {
        it("approval status", async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)




        })
    
    })

    describe("it works", () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5)})
            await transaction.wait()

            transaction = await escrow.connect(inspector).passedInspection(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it ("update ownership", async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it("update balance", async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })

})