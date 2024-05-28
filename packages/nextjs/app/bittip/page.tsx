"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import deployedContracts from '../../contracts/deployedContracts';
import { CHAIN_ID } from '~~/components/constants';
import { Address } from '~~/components/scaffold-eth';
import { QRCodeSVG } from 'qrcode.react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'usehooks-ts';


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
    const [comment, setComment] = useState('');

    
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { width, height } = useWindowSize()

    const walletClient = useWalletClient();
    const chainId = CHAIN_ID;
    

    const getContract = async () => {
        if (!walletClient.data) {
            console.error('No provider available');
            return null;
        }

        const provider = new ethers.BrowserProvider(walletClient.data);
        const signer = await provider.getSigner();
        const abi = deployedContracts[chainId]?.BitTipContract?.abi;
        const contractAddress = deployedContracts[chainId]?.BitTipContract?.address;

        if (!abi) {
            console.error('ABI not found for BitTipContract on chain', chainId);
            return null;
        }

        return new ethers.Contract(contractAddress, abi, signer);
    };
    useEffect(() => {
        const fetchEthPrice = async () => {
            try {
                const response = await fetch('/api/ethprice');
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

        setIsLoading(true);
        try {
            const tx = await contract.tipCreator(wallet, comment, {
                value: ethers.parseEther(ethAmount.toString()), // Ensure ethAmount is a string
                gasLimit: 210000,
            });
            console.log('Sending tip to $s', wallet);
            console.log('Comment:', comment);
            console.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.confirmations);

            setShowSuccessAlert(true);
            setShowConfetti(true); 
            setTimeout(() => {
                setShowSuccessAlert(false);
                setShowConfetti(false); 
                setUsdAmount('');
                setEthAmount('');
                setComment('');
            }, 5000);

        } catch (error) {
            console.error('Error sending tip:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Regular expression to allow only positive integers
        const validValue = e.target.value.replace(/[^0-9]/g, '');
        setUsdAmount(validValue);
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
        <div className="flex flex-col items-center min-h-screen pt-16 space-y-4">
            {/* Confetti */}
            {showConfetti && <Confetti width={width} height={height} />}
             {/* Success alert */}
             {showSuccessAlert && (
                <div role="alert" className="alert alert-success mx-auto w-full max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${usdAmount} has been sent! Thank you for the support!</span>
                </div>
            )}
            <div className="flex flex-col items-center space-y-4 px-6 py-6 bg-white rounded-lg shadow-md max-w-md w-full">
                {/* User Info */}
                <div className="flex justify-center items-center space-x-4">
                    <div className="avatar">
                        <div className="w-28 rounded-full h-28 mx-auto">
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
                        className="btn "
                    >
                        $3 USD
                    </button>
                    <button
                        type="button"
                        onClick={() => setUsdAmount("5")}
                        className="btn"
                    >
                        $5 USD
                    </button>
                    <button
                        type="button"
                        onClick={() => setUsdAmount("10")}
                        className="btn "
                    >
                        $10 USD
                    </button>

                    {/* Custom amount USD Input */}
                    <div className="flex-grow">
                        <input
                            type="number"
                            value={usdAmount}
                            onChange={handleUsdAmountChange} // Pass the entire event object
                            placeholder="USD"
                            className="input input-bordered w-full max-w-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>

                {/* Equivalent ETH Amount */}
                <div>
                    {ethAmount && (
                        <p className="text-gray-800">{usdAmount}$ ≈ {ethAmount} ETH</p>
                    )}
                </div>

                {/* Comment input */}
                <div>
                    <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Say something nice" className="input input-bordered w-full max-w-xs" />
                </div>

                {/* Send Tip Button */}
                <button
                    onClick={handleTip}
                    className="btn btn-success  disabled:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-200"
                    disabled={isLoading}
                >
                    Send Tip
                </button>

            </div>           

            {/* Progress bar */}
            {isLoading && (
                    <progress className="progress w-56"></progress>
                )}

            {/* Send Tip Directly Button */}
            {isButtonVisible && (
                <div className="flex flex-col items-center  pt-4">
                    <p className="text-gray-500 text-xs text-center">
                        The transaction includes 1% platform fee and doesn't include the gas fee
                    </p>
                    <button
                        onClick={toggleAddressVisibility}
                        className="btn btn-ghost"
                        style={{ opacity: 0.7 }}
                    >
                        show tip address
                    </button>
                </div>
            )}
            {/* Address Component */}

            {isAddressVisible && (
                <div className="flex justify-center items-center mt-4 pt-16 space-x-4">
                    <div className="flex flex-col items-center">
                        <p>ETH</p>
                    </div>
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