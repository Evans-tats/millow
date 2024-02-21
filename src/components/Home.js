import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, account, provider, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [haslended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [ lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
    
        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)
        const hasBought = await escrow.approval(home.id,buyer)
        setHasBought(hasBought)
        

        const seller = await escrow.seller()
        setSeller(seller)
        const hasSold = await escrow.approval(home.id,seller)
        setHasSold(hasSold)

        const lender = await escrow.lender()
        setLender(lender)
        const haslended = await escrow.approval(home.id,lender)
        setHasLended(haslended)

        const inspector = await escrow.inspector()
        setInspector(inspector)
        const hasInspected = await escrow.passedInspection(home.id)
        setHasInspected(hasInspected)

    }
    const fetchOwner = async () => {
        if (await escrow.islisted(home.id)) return
        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner()

        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()
        setHasBought(true)
    }   

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        const transaction = await escrow.connect(signer).passedInspection(home.id, true)
        await transaction.wait()

    }
    const letHandler = async () => {
        const signer = await provider.getSigner()

        const transaction = await connect(signer).approveSale(home.id)
        await transaction.await()

        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gaslimit: 60000})

        setHasLended(true)
    }   

    const sellHandler = async () => {

    }
    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])
  
    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt = "Home" />

                </div>
                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds I
                        <strong>{home.attributes[3].value}</strong> ba I
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>
                    
                    {owner ? (
                        <div className = 'home__owned'>
                            Owned by {owner.slice(0, 6) + '.....' + owner.slice(38, 42)}
                        </div>

                    ) : (
                        <div>
                            {(account ===inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (account === lender) ? (
                                <button className='home__buy' onClick={letHandler} disabled={haslended}>
                                    Approve & lend
                                </button>
                            ) : (account === seller) ? (
                                <button className='home__buy' onClick={sellHandler} disabled = {hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className='home__sell' onClick={buyHandler} disabled={hasBought}>
                                    Buy
                                </button>
                            )}
                        
                        </div>

                    )}
                    
                    <div>
                        <button className='home__buy'>
                            buy
                        </button>
                        <button className='home__contact'>
                            Contact agent
                        </button>

                    </div>
                    <hr></hr>
                   
                    <p>
                    {home.description}
                    </p>
                    <hr></hr>
                    <h2>facts and features</h2>
                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>

                        ))}
                    
                    </ul>

                </div>


            </div>
            <button onClick={togglePop} className='home__close'>
                <img src={close} alt="close"></img>
            </button>
        </div>
    );
}

export default Home;
