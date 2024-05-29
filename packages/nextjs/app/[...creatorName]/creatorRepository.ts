
import {supabase} from '~~/utils/supabase/client'; // Adjust the import path as necessary

export interface CreatorData {
  avatar_url: string;
  name: string;
  description: string;
  wallet: string;
}

export const getCreatorData = async (creatorName: string): Promise<CreatorData | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('name', creatorName)
    .single(); 
  if (error) {
    console.error('Error fetching creator data:', error);
    return null;
  }

  return data;
};
