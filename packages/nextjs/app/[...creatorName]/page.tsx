'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CreatorData, getCreatorData } from './creatorRepository'; // Adjust the import path as necessary
import Creator from '../bittip/page';
import { LoaderIcon } from 'react-hot-toast';

const CreatorPage: React.FC = () => {
  const pathname = usePathname();
  const creatorName = pathname.split('/').pop();
  const [creatorInfo, setCreatorInfo] = useState<CreatorData | null>(null);

  useEffect(() => {
    const fetchCreatorData = async () => {
      if (creatorName) {
        const data = await getCreatorData(creatorName);
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
    return (
      <div className="relative h-screen w-full">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
          <span className="loading loading-ring loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Creator
        avatar_url={creatorInfo.avatar_url}
        name={creatorInfo.name}
        description={creatorInfo.description}
        wallet={creatorInfo.wallet}
      />
    </div>
  );
};

export default CreatorPage;