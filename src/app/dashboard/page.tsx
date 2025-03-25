'use client'
import { auth } from "~/auth";
import Image from "next/image";
import logo from "~/../public/logo.png";
import SignOutBtn from "../_components/signOutBtn";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkSession = async () => {
        const res = await fetch("/api/auth/authuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
    
        if (res.redirected) {
          router.push(res.url); 
        } else {
          const sessionData = await res.json();
          setSession(sessionData.session);
          setLoading(false);
        }
      };

    useEffect(() => {
        checkSession();
      }, []);

    if (loading) {
      return <div>Loading...</div>; // or a loading spinner
    }

    if (!session) {
      router.push('/'); // In case the session is still null after the check
      return null;
    }

    return (
        <main className="min-h-screen bg-white flex flex-col text-white">
            <header className="absolute top-0 left-0 w-full p-4 text-2xl text-black font-medium flex items-center justify-between">
                <div className="flex gap-2 flex-row items-center">
                    <Image src={logo} alt="Eltaria Logo" width={35} height={35} />
                    <p>Eltaria</p>
                </div>
                <SignOutBtn />
            </header>
        </main>
    );
}
