"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import deployedContracts from '../../contracts/deployedContracts';
import { CHAIN_ID } from '~~/components/constants';
import { Address } from '~~/components/scaffold-eth';
import { QRCodeSVG } from 'qrcode.react';

export interface CreatorProps {
    avatar_url: string;
    name: string;
    description: string;
    wallet: string;
}

const Creator: React.FC<CreatorProps> = ({ avatar_url, name, description, wallet }) => {
    const [usdAmount, setUsdAmount] = useState('');
    const [ethAmount, setEthAmount] = useState('');
    const [ethPrice, setEthPrice] = useState(null);
    const [isAddressVisible, setIsAddressVisible] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(true);

    const walletClient = useWalletClient();

    const chainId = CHAIN_ID;

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
    useEffect(() => {
        const fetchEthPrice = async () => {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    'x-cg-pro-api-key': process.env.COINGECKO_API_KEY
                }
            };

            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', options);
                const data = await response.json();
                setEthPrice(data.ethereum.usd);
            } catch (err) {
                console.error('Error fetching ETH price:', err);
            }
        };

        fetchEthPrice();
    }, []);


    const convertUsdToEth = (usdAmount) => {
        if (ethPrice) {
            return (usdAmount / ethPrice).toFixed(18); // 18 decimals for ETH
        }
        return null;
    };

    const handleTip = async () => {
        const contract = await getContract();
        if (!contract) return;

        try {
            const tx = await contract.tipCreator(wallet, {
                value: ethers.parseEther(ethAmount.toString()), // Ensure ethAmount is a string
                gasLimit: 210000,
            });
            console.log('Sending tip to $s', wallet);
            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.confirmations);
        } catch (error) {
            console.error('Error sending tip:', error);
        }
    };


    useEffect(() => {
        if (usdAmount) {
            const eth = convertUsdToEth(usdAmount);
            setEthAmount(eth);
        } else {
            setEthAmount('');
        }
    }, [usdAmount, ethPrice]);

    const toggleAddressVisibility = () => {
        setIsAddressVisible(true);
        setIsButtonVisible(false);
    };










    return (
        <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
            <div className="flex flex-col items-center space-y-4 px-6 py-6 bg-white rounded-lg shadow-md max-w-md w-full">
                {/* User Info */}
                <div className="flex justify-center items-center space-x-4">
                    <div className="avatar">
                        <div className="w-24 rounded-full h-24 mx-auto">
                            <img src={avatar_url} alt="Avatar" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                    <p className="text-gray-600">{description}</p>
                </div>

                {/* Tip Buttons and Input */}
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setUsdAmount("3")}
                        className="px-4 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        $3 USD
                    </button>
                    <button
                        type="button"
                        onClick={() => setUsdAmount("5")}
                        className="px-4 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        $5 USD
                    </button>
                    <button
                        type="button"
                        onClick={() => setUsdAmount("10")}
                        className="px-4 py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        $10 USD
                    </button>
                    <div className="flex-grow">
                        <input
                            type="number"
                            value={usdAmount}
                            onChange={(e) => setUsdAmount(e.target.value)}
                            placeholder="Enter custom amount (USD)"
                            className="w-full px-4 py-2 border rounded-md border-gray-300 bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Equivalent ETH Amount */}
                <div>
                    {ethAmount && (
                        <p className="text-gray-800">Equivalent in ETH: {ethAmount}</p>
                    )}
                </div>

                {/* Send Tip Button */}
                <button
                    onClick={handleTip}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                >
                    Send Tip
                </button>


            </div>

            {/* Send Tip Directly Button */}
            {isButtonVisible && (
                <button
                    onClick={toggleAddressVisibility}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                    ...or send tip directly
                </button>
            )}
            {/* Address Component */}

            {isAddressVisible && (
                <div className="flex justify-center items-center mt-4 space-x-4">
                    <div className="flex flex-col items-center">
                        <Address address={wallet} />
                    </div>
                    <div>
                        <QRCodeSVG value={wallet} size={100} />
                    </div>
                </div>
            )}

        </div>
    );

};


export default Creator;