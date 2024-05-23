
import {supabase} from '~~/utils/supabase/client'; // Adjust the import path as necessary

export interface CreatorData {
  avatar_url: string;
  name: string;
  description: string;
  wallet: string;
}

export const getCreatorData = async (creatorName: string): Promise<CreatorData | null> => {
  const { data, error } = await supabase
    .from('profiles') // Assume your table is named 'creators'
    .select('*')
    .ilike('name', creatorName) // Assuming you want case-insensitive matching
    .single(); // Use .single() if you expect only one record or know 'name' is unique

  if (error) {
    console.error('Error fetching creator data:', error);
    return null;
  }

  return data;
};
