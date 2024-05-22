'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import SignOutButton from '~~/components/SignOutButton';
import { supabase } from '~~/utils/supabase/client';

export default function ProfilePage() {

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        redirect('/login');
      }
    };

    checkUser();
  }, []);

  // const handleSignOut = async () => {
  //   const { error } = await supabase.auth.signOut();
  //   if (!error) {
  //     redirect('/login');
  //   }
  // };

  return (
    <div>
      <p>Hello,</p>
      <SignOutButton />
    </div>
  );
}
