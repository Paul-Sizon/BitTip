"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { supabase } from '~~/utils/supabase/client';
import { FiCopy, FiCheck } from 'react-icons/fi';


const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const checkRegistration = async () => {
      if (!connectedAddress) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('wallet', connectedAddress)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        return;
      }

      if (data && data.name) {
        setUsername(data.name);
        setProfileUrl(`https://bittip.id/${data.name}`);
      }
      setLoading(false);
    };

    checkRegistration();
  }, [connectedAddress, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 600);
    });
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <div className="flex justify-center items-center">
          <img alt="BitTip logo" className="w-64" src="/logo.png" />
        </div>
        <div className="flex items-center flex-col flex-grow max-w-xl mx-auto">
          <p className="text-center text-lg ">BitTip is a platform for sending tips to content creators using Ethereum smart contracts, ensuring transparency, security, and efficiency.</p>
        </div>

        {connectedAddress ? (
          <div className="flex flex-col items-center">
            {!loading && (username ? (
              <div className="flex flex-col items-center justify-center space-y-4 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="label-text-alt text-lg">
                    <strong className="text-lg">{profileUrl}</strong>
                  </span>
                  <button onClick={handleCopy} className="btn btn-ghost text-lg">
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                <Link href={`/${username}`} className="btn btn-wide font-bold mt-6 bg-blue-500 hover:bg-blue-700 text-white text-lg">
                  Go to My Profile
                </Link>
              </div>

            ) : (
              <Link href="/settings"
                className="btn btn-success btn-wide font-bold mt-6">
                Register
              </Link>
            ))}
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
