'use client'
import { signIn } from "next-auth/react";

export default function SignInBtn() {
    return (
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className='bg-blue-500 mt-3 text-white py-1 px-2 rounded-md hover:bg-blue-600'>
            Sign in with Google
        </button>
    );
}