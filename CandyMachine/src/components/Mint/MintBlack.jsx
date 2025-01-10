window.global ||= window;

import React, { useState, useEffect } from "react";
import { publicKey } from "@metaplex-foundation/umi";
import { useWallet } from "@solana/wallet-adapter-react";
import { walletAdapterIdentity } from "@metaplex-foundation/js";
import { fetchorderById, saveOrderInfo } from "../../firebase/query";
import CheckoutForm from "../CheckoutForm"; 
import { toast } from "react-toastify";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
const QUICKNODE_RPC = "https://api.devnet.solana.com"; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC, {
  commitment: "finalized",
});

function MintBlack({ color }) {
  const [candyMachineAddress, setCandyMachineAddress] = useState(null);
  
  const wallet = useWallet();

  const METAPLEX = Metaplex.make(SOLANA_CONNECTION).use(walletAdapterIdentity(wallet));

  async function mintEachNFT() {
    console.log("Minting each NFT...");
    const candyMachine = await METAPLEX.candyMachines().findByAddress({
      address: new PublicKey(candyMachineAddress),
    });
    let { nft, response } = await METAPLEX.candyMachines().mint(
      {
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
      },
      { commitment: "finalized" }
    );
  
    console.log(`✅ - Minted NFT: ${nft.address.toString()}`);
    console.log(
      `     https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
    );
    console.log(
      `     https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
    );
  }

  useEffect(() => {
    const fetchOrderData = async () => {
      const order = await fetchorderById('4fd7R1QJZqX9JcVRqTqBfJxJUAchW745EvHDVTHoyvDR');
      console.log("Order", order);
    };
    fetchOrderData();
    let address;
    if (color === "black") {
      address = publicKey(import.meta.env.VITE_BLACK_CANDY_MACHINE_ID);
    } else if (color === "white") {
      address = publicKey(import.meta.env.VITE_WHITE_CANDY_MACHINE_ID);
    } else {
      address = publicKey(import.meta.env.VITE_BLUE_CANDY_MACHINE_ID); //color doesn't come in correctly
    }
    setCandyMachineAddress(address); // Установка адреса Candy Machine
    console.log("Candy Machine Address : ", address);
    console.log("color : ", color)
  }, [color]);

  const mainnetEndpoint = import.meta.env.VITE_NEXT_PUBLIC_RPC || "https://api.mainnet-beta.solana.com";
  console.log("---------------------------\n", mainnetEndpoint)

  const handleOrderSubmission = async (orderData, size) => {
    console.log("Order Submitted:", orderData);
    await mintNFT(orderData, size);
  };

  const mintNFT = async (orderData, size) => {
    try {
      console.log("Minting NFT...");

      await mintEachNFT();
      
      const billingInfo = {
        name: orderData.fullName,
        email: orderData.email,
        address: orderData.addressLine1,
        city: orderData.city,
        state: orderData.state,
        zip: orderData.postalCode,
      };

      const nftMetadata = {
        nftAddress: wallet.publicKey,
        trait: generateRandomTrait(),
        size,
      };

      console.log("NFT Metadata:", nftMetadata);
      await saveOrderInfo(wallet.publicKey.toString(), nftMetadata, billingInfo);

    } catch (error) {
      console.error("Mint failed:", error);
      toast.warn("Mint failed! Please try again.");
    }
  };

  function generateRandomTrait() {
    const traits = ["Discount Rate for Krypt Products", "Access to VIP Events", "Exclusive Community Access", "Gift Box Access"];
    const randomIndex = Math.floor(Math.random() * traits.length);
    return traits[randomIndex];
  }

  return (
    <div>
      <CheckoutForm submitOrder={handleOrderSubmission} />
    </div>
  );
}

export default MintBlack;
