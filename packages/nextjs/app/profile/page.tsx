"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from "wagmi";
import { supabase } from '~~/utils/supabase/client';

const ProfileRedirect = () => {
    const { address: connectedAddress } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkRegistration = async () => {  

      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('wallet', connectedAddress)
        .single();

      if (data && data.name) {
        setUsername(data.name);
        router.push(`/${data.name}`); 
      } else {
        router.push('/settings'); 
      }
    };

    checkRegistration();
  }, [connectedAddress, router]);


  return (
    <div className="relative h-screen w-full">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      </div>
  );
};

export default ProfileRedirect;
