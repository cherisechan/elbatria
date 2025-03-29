'use client';
import Image from "next/image";
import logo from "~/../public/logo.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Profile from "../_components/profile";
import CreateBases from "../_components/createBases";
import BaseCard from "../_components/baseCard";
import { getURL } from "next/dist/shared/lib/utils";
import { api } from "~/trpc/react";
import Cookies from 'js-cookie';
interface SessionData {
    user: {
        name: string;
        email: string;
        image: string;
    };
    expires: string;
}

export default function Dashboard() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [uid, setUid] = useState<string>("-1");
    const router = useRouter();

    const checkSession = async (): Promise<void> => {
        try {
            const res = await fetch("/api/auth/authuser", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
            });

            if (res.redirected) {
                router.push(res.url);
                return
            } 
            const sessionData = (await res.json()) as { session: SessionData | null };
            setSession(sessionData.session);
        } catch (error) {
            console.error("Error checking session:", error);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        void checkSession();
    }, []);

    const { data: bases, isLoading: isBasesLoading, isError: isBasesError } = api.base.getBases.useQuery(
        { user_id: uid },
        { enabled: uid !== "-1" } // Only trigger the query once uid is valid
    );

    useEffect(() => {
        const fetchUid = async () => {
            const getuid = await fetch("/api/auth/userid", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session }),
            });
            const getuidObj = await getuid.json();
            if (getuidObj) {
                setUid(getuidObj.uid);
                Cookies.set('userid', getuidObj.uid, { expires: 30 });
            }
        }
        if (session) { 
            void fetchUid();
        }
    }, [session])

    // fetch the bases cards
    useEffect(() => {
        console.log(uid)
    },[uid])

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!session) {
        router.push('/');
        return null;
    }

    return (
        <main className="min-h-screen bg-white flex flex-col text-white">
            <header className="absolute top-0 left-0 w-full p-4 h-[60px] text-2xl text-black font-medium flex items-center justify-between border-solid border-gray-200 border-b-1">
                <div className="flex gap-2 flex-row items-center">
                    <Image src={logo} alt="Elbatria" width={35} height={35} />
                    <p>Elbatria</p>
                </div>
                {
                    session !== null &&
                    <Profile session={session}/>
                }
            </header>
            <div className="page-height w-full mt-[60px] bg-[#f8fafc] p-5">
                <CreateBases id={uid}/>
                {bases?.map((base) => (
                    <div key={base.id} className="border p-4 rounded shadow-lg">
                        <h3 className="text-xl font-bold text-black">{base.name}</h3>
                    </div>
                ))}
            </div>
        </main>
    );
}
