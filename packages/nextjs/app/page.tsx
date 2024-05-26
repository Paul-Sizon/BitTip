"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { supabase } from '~~/utils/supabase/client';

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRegistration = async () => {
      if (!connectedAddress) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('wallet', connectedAddress)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data && data.name) {
        setUsername(data.name);
        // router.push(`/${data.name}`);  // Redirect to profile page by username
      } else {
        // router.push('/register');  // Redirect to registration page
      }
    };

    checkRegistration();
  }, [connectedAddress, router]);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">BitTip</span>
        </h1>
        <div className="flex items-center flex-col flex-grow max-w-xl mx-auto">
          <p className="text-center text-lg ">BitTip is a tipping platform using a smart contract on the Ethereum blockchain, aimed at enabling users to send tips to content creators in a transparent, secure, and efficient manner.</p>
        </div>

        {connectedAddress ? (
          <div className="flex flex-col items-center">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
            {username ? (
              <Link href={`/${username}`} className="btn btn-wide font-bold mt-6 bg-blue-500 hover:bg-blue-700 text-white">
                Go to My Profile
              </Link>
            ) : (
              <Link href="/settings"
                className="btn btn-success btn-wide font-bold mt-6">
                Register
              </Link>
            )}
          </div>
        ) : (

          <div className="flex flex-col items-center">
            <p className="text-center" >Please connect your wallet to access features.</p>
            <RainbowKitCustomConnectButton />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
