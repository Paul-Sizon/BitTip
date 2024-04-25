'use client';

import Creator from '../bittip/page'
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCreatorData } from './creatorRepository';

const CreatorPage: React.FC = () => {
  const pathname = usePathname();
  const creatorName = pathname.split('/').pop();
  const [creatorInfo, setCreatorInfo] = useState<{
    image: string;
    name: string;
    description: string;
    creatorWalletAddress: string;
  } | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (creatorName) {
        const data = getCreatorData(creatorName);
        if (data) {
          setCreatorInfo(data);
        } else {
          console.log(`Creator "${creatorName}" not found in the database.`);
        }
      }
    };

    fetchCreatorData();
  }, [creatorName]);

  if (!creatorInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Creator
        image={creatorInfo.image}
        name={creatorInfo.name}
        description={creatorInfo.description}
        creatorWalletAddress={creatorInfo.creatorWalletAddress}
      />
    </div>
  );
};

export default CreatorPage;