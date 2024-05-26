'use client';

import { useState, useRef, useEffect } from "react";
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation'

import { supabase } from '~~/utils/supabase/client';
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const ProfilePage = () => {
  const router = useRouter();
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const inputFile = useRef(null);
  const [mode, setMode] = useState("register");  // 'register' or 'update'


  const { address } = useAccount();
  const [profile, setProfile] = useState({
    creatorWalletAddress: address,
    name: "",
    description: "",
    image: ""
  });

  useEffect(() => {
    if (address) {
      loadProfile(address);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const uploadFile = async (fileToUpload) => {
    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", fileToUpload);
      const res = await fetch("/api/files", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      setCid(resData.IpfsHash);
      setProfile({ ...profile, image: resData.IpfsHash });
      setUploading(false);
    } catch (e) {
      console.error(e);
      setUploading(false);
      alert("Trouble uploading file");
    }
  };

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    uploadFile(e.target.files[0]);
  };

  const saveProfile = async () => {
    const confirmation = window.confirm(`Are you sure you want to ${mode === "update" ? "update" : "create"} your profile?`);
    if (!confirmation) {
      return;
    }

    const defaultImage = `https://robohash.org/${address}.png?set=set5`;
    const avatarUrl = cid ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}` : defaultImage;

    try {
      const profileData = {
        wallet: address,  // This should be your unique identifier
        name: profile.name,
        description: profile.description,
        avatar_url: avatarUrl
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'wallet', // Specify the conflict resolution strategy
        });

      if (error) {
        console.error('Error saving profile:', error);
        alert(`Could not save/update profile: ${error.message}`);
      } else {
        alert('Profile saved/updated successfully!');
        router.push(`/${profile.name}`);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      alert('An unexpected error occurred');
    }
  };


  const loadProfile = async (walletAddress) => {
    setIsLoading(true);

    if (!walletAddress) {
      console.log("No wallet address provided.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet', walletAddress)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      alert('Could not load profile data.');
      setIsLoading(false);
    } else if (data) {
      setProfile({
        name: data.name,
        description: data.description,
        creatorWalletAddress: data.wallet,
        image: data.avatar_url || `https://robohash.org/${walletAddress}.png?set=set5`
      });
      setMode("update");
      setIsLoading(false);
    } else {
      console.log(`No profile found for wallet: ${walletAddress}`);
      setMode("register");
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center min-h-screen pt-16 space-y-4">

      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex justify-center items-center">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      )}
      <div className={`flex flex-col items-center space-y-4 px-6 py-6 bg-white rounded-lg shadow-md max-w-md w-full ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {address ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">{mode === "update" ? "Update Your Profile" : "Register Your Profile"}</h2>
            <div className="mb-4 flex flex-col items-center justify-center">
              {cid && (
                <div className="avatar mb-2">
                  <div className="w-32 rounded-full h-32 mx-auto">
                    <img
                      src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`}
                      alt="Profile Avatar"
                    />
                  </div>
                </div>
              )}
              <input type="file" id="file" ref={inputFile} onChange={handleChange} style={{ display: 'none' }} />
              <button
                className={`w-full text-center py-2 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
                disabled={uploading}
                onClick={() => inputFile.current.click()}
              >
                {uploading ? "Uploading..." : "Upload Avatar"}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={profile.description || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
              <input
                type="text"
                name="creatorWalletAddress"
                value={profile.creatorWalletAddress || address || ''}
                readOnly
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-500 bg-gray-100 sm:text-sm"
              />
            </div>
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
              onClick={saveProfile}
            >
              {mode === "update" ? "Update Profile" : "Create Profile"}
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            <h2 className="text-xl font-semibold">Wallet Not Connected</h2>
            <p className="text-gray-600">Please connect your wallet to access the profile page.</p>
            <RainbowKitCustomConnectButton />
          </div>
        )}
      </div>
    </div>
  );
};



export default ProfilePage;


