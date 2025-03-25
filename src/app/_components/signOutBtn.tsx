'use client'

import { useRouter } from 'next/navigation';

export default function SignOutBtn() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', {
      method: 'POST',
    });
    router.push('/'); // Redirect to home or login page after sign out
  };

  return (
    
    <button onClick={handleSignOut} className='bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600'>Sign Out</button>
  );
}