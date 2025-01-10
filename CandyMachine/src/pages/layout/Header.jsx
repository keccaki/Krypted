import React, { useEffect, useMemo } from "react";
import NavMobile from "./naviagtions/NavMobile";
import CandyMachineImage from "../../assets/candy-machine.png";
import { Connection, PublicKey} from "@solana/web3.js";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import "./Header.css"; // Import CSS file

import {
  Metaplex,
  walletAdapterIdentity,
  toBigNumber,
  toDateTime,
  sol,
} from "@metaplex-foundation/js";

const NFT_METADATA_DEVNET = [
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreigcxbd3zkr574j7qrnfxvvptfvp7ab4f6wm65bag4pykfjonzfa4a", // Black
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreif46dul3io4wsgapnhylp2unrtptnlq46mxskmedc7cd6grwbj7uu", // Blue
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreigcxbd3zkr574j7qrnfxvvptfvp7ab4f6wm65bag4pykfjonzfa4a", // White
];
const NFT_METADATA_MAINNET = [
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreiewg2wovrfgeq2x46tuxrjibbu5o3gaz3h5vmh5hfpcs3353yclw4", // Black 
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreifnv3wyotsr3k3hmkmbbqp544qrd2ect7ngyqfwfs2ob2ww34h",    // Blue  
  "https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafkreia6plgpmczwfsw4kwr7y7kxgfd5ftmt6deryuxyxohuqz5bu4ct6y", // White 
];

const metadataNft = (index, flag) => {
  let prefix = '', group = '';
  if(flag) {
    switch (index) {
      case 0:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeiaojfobwstendmz7qwhxxuoufhr2kfsdxw2uibnbmb2jjl23lpbte/'
        group = 'black_nft';
        break;
      case 1:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeiavpjntvmtynrlbw44szzx6kxs76t2jqgdp5k6cu26m6yeixt3t3a/'
        group = 'blue_nft';
        break;
      case 2:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeihnhzpwl2shgmucdtxezled5g36mfwfrtrqomitdqjfj2ap6in7gy/'
        group = 'white_nft';
        break;
      default:
        break;
    }
  } else {
    switch (index) {
      case 0:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeidbhtujs4jdiqnbb4wb3v32gwlohprqvsir263ldyzprvd5wcmwba/'
        group = 'black_nft';
        break;
      case 1:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeie6t2vy7z7ohmaqtrbclslbrtwzo5rw27vq3x4s3gb6u7tmmkyyh4/'
        group = 'blue_nft';
        break;
      case 2:
        prefix = 'https://chocolate-left-jellyfish-658.mypinata.cloud/ipfs/bafybeieyyqek74rmtpkrm7wvxydpljirl4ie2txig776wnmm7o3opjktsy/'
        group = 'white_nft';
        break;
      default:
        break;
    }
  }
  const metaArray = Array(33).fill(0).map((_, index) => {
    if(index < 10) return prefix + group + '0'+`${index+1}`+'.json'
    return prefix + group +`${index+1}`+'.json';
  })
  return metaArray;
}


const QUICKNODE_RPC_DEVNET = "https://api.devnet.solana.com";
const QUICKNODE_RPC_MAINNET = "https://solana-mainnet.g.alchemy.com/v2/GuFjNbCz0nE_MaDkS03qlS7taILTRjKg"

function Header() {
  const [isMainnet, setIsMainnet] = useState(true);
  const [collectionAdd, setCollectionAdd] = useState([]);
  const [candyMachineAdd, setCandyMachineAdd] = useState([]);

  const handleCheckboxChange = () => {
    setIsMainnet((prevIsMainnet) => !prevIsMainnet);
  };

  useEffect(() => {
    setConsoleResult(`Current RPC URL: ${isMainnet ? QUICKNODE_RPC_MAINNET : QUICKNODE_RPC_DEVNET}`);
  },[isMainnet])

  const colors = ["Black", "Blue", "White"];
  const wallet = useWallet();
  const { publicKey } = useWallet();
  
  const connection = useMemo(() => {
    return new Connection(
      isMainnet ? QUICKNODE_RPC_MAINNET : QUICKNODE_RPC_DEVNET,
      {
        commitment: "finalized",
      }
    );
  },[wallet, isMainnet]);

  const METAPLEX = useMemo(() => {
    if (publicKey) {
      return Metaplex.make(connection).use(
        walletAdapterIdentity(wallet)
      );
    }
    return null;
  }, [wallet, isMainnet]);

  const [consoleResult, setConsoleResult] = useState("Console:");

  const addLogsToConsole = (newLine) => {
    setConsoleResult((prevConsoleResult) => prevConsoleResult + "\n" + newLine);
  };

  const createCollectionNft = async (index) => {
    const { nft: collectionNft } = await METAPLEX.nfts().create({
      name: `Krypt NFT Collection ${colors[index]} `,
      uri: isMainnet ? NFT_METADATA_MAINNET[index] : NFT_METADATA_DEVNET[index],
      sellerFeeBasisPoints: 500,
      isCollection: true,
      updateAuthority: wallet,
      properties: {
        customProperty: Date.now().toLocaleString(),
      },
    });
    let add = collectionAdd;
    add[index] = collectionNft.address.toString();
    setCollectionAdd(add);
    addLogsToConsole(
      `✅ - Minted Collection NFT ${index} ${colors[index]}: ${collectionNft.address.toString()}`
    );
    addLogsToConsole(
      `     https://explorer.solana.com/address/${collectionNft.address.toString()}?`
    );
  };

  const generateCandyMachine = async (index) => {
    console.log(index, collectionAdd[index]);
    const candyMachineSettings = {
      itemsAvailable: toBigNumber(33), 
      sellerFeeBasisPoints: 500, // 10% Royalties on Collection
      symbol: "KVM",
      maxEditionSupply: toBigNumber(0), 
      isMutable: true,
      creators: [{ address: wallet.publicKey, share: 100 }],
      collection: {
        address: new PublicKey(collectionAdd[index]), 
        updateAuthority: wallet,
      },
    };
    const { candyMachine } = await METAPLEX.candyMachines().create(
      candyMachineSettings
    );
    let add = candyMachineAdd;
    add[index] = candyMachine.address.toString();
    setCandyMachineAdd(add);
    addLogsToConsole(
      `✅ - Created Candy Machine ${index} ${colors[index]}: ${candyMachine.address.toString()}`
    );
    addLogsToConsole(
      `     https://explorer.solana.com/address/${candyMachine.address.toString()}?`
    );
  };

  const updateCandyMachine = async (index) => {
    const candyMachine = await METAPLEX.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdd[index]),
    });

    const { response } = await METAPLEX.candyMachines().update({
      candyMachine,
      guards: {
        startDate: { date: toDateTime("2024-12-7T16:00:00Z") },
        mintLimit: {
          id: 1,
          limit: 33,
        },
        solPayment: {
          amount: sol(0.42),
          destination: METAPLEX.identity().publicKey,
        },
      },
    });

    addLogsToConsole(`✅ - Updated Candy Machine: ${candyMachineAdd[index]}`);
    addLogsToConsole(
      `     https://explorer.solana.com/tx/${response.signature}?`
    );
  };

  async function addItems(index) {
    const metadata = metadataNft(index, isMainnet);
    const candyMachine = await METAPLEX.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAdd[index]),
    });
    for (let j = 0; j < 11; j++) {
      const items = [];
      for (let i = 0; i < 3; i++) {
        addLogsToConsole(`${colors[index]} Adding item ${3 * j + i + 1}`);
        items.push({
          name: `Krypt x Meshvault ${colors[index]} # ${3 * j + i + 1}`,
          uri: metadata[3*j + i],
          attributes: {
            edit:`${j*3 + i +1}`,
            network: isMainnet 
            ? 'main'
            : 'dev',
            color:colors[index]
          }
        });
      }
      console.log(items);
      try {
        const { response } = await METAPLEX.candyMachines().insertItems(
          {
            candyMachine,
            items: items,
            index: j * 3,
          },
          { commitment: "finalized" }
        );
        console.log("response", response)
      } catch(err) {
        console.log('addItemError:', err);
      }
      addLogsToConsole(
        `✅ - Items added to Candy Machine ${index}: ${candyMachineAdd[index]}`
      );
    }
  }
  
  const createCollectionNFTClicked = async () => {
    addLogsToConsole("Creating NFT Collections ...");
    for (let i = 0; i < 3; ++i) {
      await createCollectionNft(i);
    }
    addLogsToConsole("Collection NFT Addresses addition complte");
  };

  const candyMachineClick = async () => {
    addLogsToConsole("Generating candy machine ...");
    for (let i = 0; i < 3; ++i) {
      await generateCandyMachine(i);
    }
    addLogsToConsole("Generating candy machine addition complte");
  };

  const updateCandyGuard = async () => {
    addLogsToConsole("Updating CandyGuard ...");
    for (let i = 0; i < 3; ++i) {
      await updateCandyMachine(i);
    }
    addLogsToConsole("Updating CandyGuard addition complete");
  };

  const addItemClick = () => {
    addLogsToConsole("AddItemClick function called ...");
    for (let i = 0; i < 3; ++i) {
      addItems(i);
    }
    addLogsToConsole("AddItemClick function call completed");
  };

  return (
    <React.Fragment>
      <section className=" lg:hidden">
        <NavMobile />
      </section>
      <main className="main-header bg-primary flex items-center justify-between px-5">
        <img className="header-logo" src={CandyMachineImage} />
        <div>
          <input
            type="checkbox"
            id="isMainnet"
            name="isMainnet"
            checked={isMainnet}
            onChange={handleCheckboxChange}
          />
          <span onClick={handleCheckboxChange}>Is main-net?</span>
        </div>
        <section className="lg:block hidden wallet-connect-btn">
          <WalletMultiButton />
        </section>

        <div className="buttons">
          <button
            onClick={async () => await createCollectionNFTClicked()}
            className={`submit-button cursor-pointer justify-center items-center`}
          >
            Create NFT Collection
          </button>
          <button
            onClick={async () => await candyMachineClick()}
            className={`submit-button cursor-pointer justify-center items-center`}
          >
            Generate Candy Machine
          </button>
          <div
            onClick={() => updateCandyGuard()} 
            className={`submit-button cursor-pointer justify-center items-center`}
          >
            Update Candy Guard
          </div>
          <div
            onClick={() => addItemClick()}
            className={`submit-button cursor-pointer justify-center items-center`}
          >
            Add Items
          </div>
        </div>
        <textarea
          readOnly
          className="console-area"
          value={consoleResult}
        ></textarea>
      </main>
    </React.Fragment>
  );
}

export default Header;
