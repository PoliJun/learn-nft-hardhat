import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";

function App() {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [escrow, setEscrow] = useState(null);
    const [homes, setHomes] = useState([]);

    const loadBlockchainData = async () => {
        // associate the provider with MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const network = await provider.getNetwork();

        const realEstate = new ethers.Contract(
            config[network.chainId].RealEstate.address,
            RealEstate,
            provider,
        );
        // * loop through the total supply of tokens( homes )
        const totalSupply = await realEstate.totalSupple();
        const homes = [];
        for (let i = 1; i <= totalSupply; i++) {
            const uri = await realEstate.tokenURI(i);
            const response = await fetch(uri);
            const metadata = await response.json();
            homes.push(metadata);
        }
        setHomes(homes);
        console.log(homes);
        const escrow = new ethers.Contract(
            config[network.chainId].Escrow.address,
            Escrow,
            provider,
        );
        setEscrow(escrow);

        console.log(
            config[network.chainId].RealEstate.address,
            config[network.chainId].Escrow.address,
        );
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
    };
    useEffect(() => {
        loadBlockchainData();
    }, []);
    return (
        <div>
            <Navigation
                account={account}
                setAccount={setAccount}
            />
            <Search />
            <div className="cards__section">
                <h3>Homes for you</h3>
                <hr />
                <div className="cards">
                    <div className="card">
                        <div className="card_image">
                            <img
                                src=""
                                alt="Home"
                            />
                        </div>
                        <div className="card__info">
                            <h4>1 ETH</h4>
                            <p>
                                <strong>1</strong> bds |<strong>2</strong> ba |
                                <strong>3</strong> sqft
                            </p>
                            <p>1234Elm st</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
