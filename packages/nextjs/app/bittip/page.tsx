"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import deployedContracts from '../../contracts/deployedContracts';
import { CHAIN_ID } from '~~/components/constants';

interface CreatorProps {
    image: string;
    name: string;
    description: string;
    creatorWalletAddress: string;
}

const Creator: React.FC<CreatorProps> = ({ image, name, description, creatorWalletAddress }) => {
    const [tipAmount, setTipAmount] = useState('');
    const walletClient = useWalletClient();
   
    const chainId = CHAIN_ID; 
    // const creatorWalletAddress = "0xdb56D8f4171EA4D9D06C66600630c7376a790244"; 

    const getContract = async () => {
        if (!walletClient.data) {
            console.error('No provider available');
            return null;
        }

        const provider = new ethers.BrowserProvider(walletClient.data);
        const signer = await provider.getSigner();
        const abi = deployedContracts[chainId]?.YourContract?.abi;
        const contractAddress = deployedContracts[chainId]?.YourContract?.address;

        if (!abi) {
            console.error('ABI not found for YourContract on chain', chainId);
            return null;
        }

        return new ethers.Contract(contractAddress, abi, signer);
    };

    const handleTip = async () => {
        const contract = await getContract();
        if (!contract) return;

        try {
            const tx = await contract.tipCreator(creatorWalletAddress, {
                value: ethers.parseEther(tipAmount),
                gasLimit: 210000,
            });
            console.log(`Transaction sent: ${tx.hash}`);
            // Handle transaction confirmation (optional)
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.confirmationCount);
        } catch (error) {
            console.error('Error sending tip:', error);
        }
    };

    return (
        <div className="flex flex-col space-y-2 px-4 py-4 bg-white rounded-lg shadow-md ">
            {/* name */}
            <div className="flex items-center space-x-2">
                <img src={image} className="w-12 h-12 rounded-full" />                                       
            </div>        
            <h2 className="text-xl font-bold text-gray-800">{name}</h2>
            <p className="text-gray-600">{description}</p>
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={() => setTipAmount(ethers.parseEther('1').toString())}
                    className="px-2 py-1 text-sm font-medium text-center text-gray-500 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    $3 USD
                </button>
                <button
                    type="button"
                    onClick={() => setTipAmount(ethers.parseEther('5').toString())}
                    className="px-2 py-1 text-sm font-medium text-center text-gray-500 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    $5 USD
                </button>
                <button
                    type="button"
                    onClick={() => setTipAmount(ethers.parseEther("10").toString())}
                    className="px-2 py-1 text-sm font-medium text-center text-gray-500 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    $10 USD
                </button>
                <div className="flex-grow">
                    <input
                        type="number"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        placeholder="Enter custom amount (ETH)"
                        className=" px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <button onClick={handleTip} className="mt-4 px-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 max-w-xs">
                Send Tip
            </button>
        </div>

    );
};

export default Creator;