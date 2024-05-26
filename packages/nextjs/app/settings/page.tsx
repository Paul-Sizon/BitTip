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
  const [isValid, setIsValid] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);

    setProfile({ ...profile, [name]: sanitizedValue });

    setIsValid(value === sanitizedValue);
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
      setProfile({ ...profile, image: `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${resData.IpfsHash}` });
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
    if (mode === "update") {
        const confirmation = window.confirm("Are you sure you want to update your profile?");
        if (!confirmation) {
            return;
        }
    }

    const defaultImage = `https://robohash.org/${address}.png?set=set5`;
    const avatarUrl = cid ? `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}` : defaultImage;

    try {
        const profileData = {
            wallet: address,  // This should be your unique identifier
            name: profile.name,
            description: profile.description,
            avatar_url: profile.image || avatarUrl,
        };

        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData, {
                onConflict: 'wallet', // Specify the conflict resolution strategy
            });

            if (error) {
              console.error('Error saving profile:', error);
          } else {
              setShowSuccessAlert(true);
              setTimeout(() => {
                  setShowSuccessAlert(false);
                  router.push(`/${profile.name}`);
              }, 3000); 
              
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
      setIsLoading(false);
    } else if (data) {
      setCid(data.avatar_url); // Set CID from the existing avatar URL if available
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

      {/* Success alert */}
      {showSuccessAlert && (
            <div role="alert" className="alert alert-success mx-auto w-full max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{mode === "update" ? "Your profile has been updated successfully!" : "Your profile has been created successfully!"}</span>
            </div>
        )}

      <div className={`flex flex-col items-center space-y-4 px-6 py-6 bg-white rounded-lg shadow-md max-w-md w-full ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        {address ? (
          <>
            <h2 className="text-2xl text-black font-semibold mb-4">{mode === "update" ? "Update Your Profile" : "Register Your Profile"}</h2>
            <div className="mb-4 flex flex-col items-center justify-center">
              {profile.image && (
                <div className="avatar mb-2">
                  <div className="w-32 rounded-full h-32 mx-auto">
                    <img
                      src={profile.image}
                      alt="Profile Avatar"
                    />
                  </div>
                </div>
              )}
              <input type="file" id="file" ref={inputFile} onChange={handleChange} style={{ display: 'none' }} />
              <button
                className={`btn text-white ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
                disabled={uploading}
                onClick={() => inputFile.current.click()}
              >
                {uploading ? "Uploading..." : "Upload Avatar"}
              </button>
            </div>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text text-black">What is your name?</span>
              </div>
              <input
                type="text"
                name="name"
                value={profile.name || ''}
                onChange={handleInputChange}
                placeholder="Pavel"
                className={`input input-bordered w-full max-w-xs ${isValid ? 'border-gray-300' : 'border-red-500'}`}
              />
              <div className="label">
                <span className="label-text-alt text-black">
                  Your URL will be: <strong>bittip.to/{profile.name || 'yourname'}</strong>
                </span>
                
              </div>
              {!isValid && (
                  <span className="text-red-500 text-sm mt-1 text-center">
                    Use only letters, numbers, underscores, or hyphens, up to 24 characters
                  </span>
                )}
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text text-black">Description:</span>
              </div>
              <input
                type="text"
                name="description"
                value={profile.description || ''}
                onChange={handleInputChange}
                placeholder="Web3 developer 😎"
                className="input input-bordered w-full max-w-xs"
              />
            </label>


            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text text-black">Wallet address:</span>
              </div>
              <input type="text" name="creatorWalletAddress" value={profile.creatorWalletAddress || address || ''} className="input input-bordered w-full  sm:text-sm shadow-sm text-gray-500 " disabled />
              <div className="label">
                <span className="label-text-alt text-black">only ETH for now</span>
              </div>
            </label>

            <button
              className="btn btn-wide btn-active bg-blue-500 hover:bg-blue-700 text-white font-bold"
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


