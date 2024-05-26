'use client';

import { useState, useRef, useEffect } from "react";
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation'

import { supabase } from '~~/utils/supabase/client';

const ProfilePage = () => {
  const router = useRouter();
  const [file, setFile] = useState("");
  const [cid, setCid] = useState("");
  const [uploading, setUploading] = useState(false);
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
    if (!walletAddress) {
      console.log("No wallet address provided.");
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
    } else if (data) {
      setProfile({
        name: data.name,
        description: data.description,
        creatorWalletAddress: data.wallet,
        image: data.avatar_url || `https://robohash.org/${walletAddress}.png?set=set5`
      });
      setMode("update");  // Set mode to update since profile data was found
    } else {
      console.log(`No profile found for wallet: ${walletAddress}`);
      setMode("register");  // Set mode to register as no profile was found
    }
  };



  const updateProfile = async () => {
    try {
      const profileData = {
        name: profile.name,
        description: profile.description,
        avatar_url: `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`  // Ensure cid is defined
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('wallet', address);  // 'address' is the wallet address of the profile to update

      if (error) {
        console.error('Error updating profile:', error);
        alert(`Could not update profile: ${error.message}`);
      } else {
        alert('Profile updated successfully!');
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      alert('An unexpected error occurred');
    }
  };

  const deleteProfile = async (walletAddress) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .delete()
        .eq('wallet', walletAddress);  // Specify the wallet address of the profile to delete

      if (error) {
        console.error('Error deleting profile:', error);
        alert(`Could not delete profile: ${error.message}`);
      } else {
        alert('Profile deleted successfully!');
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      alert('An unexpected error occurred');
    }
  };



  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">{mode === "update" ? "Update Your Profile" : "Register Your Profile"}</h2>
      <div className="mb-4">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">Upload Avatar</label>
        <input type="file" id="file" ref={inputFile} onChange={handleChange} style={{ display: 'none' }} />
        <button
          className={`w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={uploading}
          onClick={() => inputFile.current.click()}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
        {cid && (
          <div className="mt-2 text-center">
            <img
              src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`}
              alt="Profile Avatar"
              className="mx-auto h-20 w-20 rounded-full"
            />
          </div>
        )}
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
    </div>
  );
};

export default ProfilePage;


