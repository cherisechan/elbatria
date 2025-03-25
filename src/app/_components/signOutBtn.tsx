'use client'

import { useRouter } from 'next/navigation';

export default function SignOutBtn() {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', {
      method: 'POST',
    });
    router.push('/');
  };

  return (
    
    <button onClick={handleSignOut} className='bg-blue-500 w-[100%] mt-3 text-white py-1 px-2 rounded-md hover:bg-blue-600'>Sign Out</button>
  );
}