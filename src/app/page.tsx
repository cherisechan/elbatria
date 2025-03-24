import { api, HydrateClient } from "~/trpc/server";
import { auth, signIn, signOut } from "~/auth"
import Link from 'next/link';
import SignInBtn from "./_components/signInBtn";
import Image from "next/image";
import logo from '~/../public/logo.png'

export default async function Landing() {
    const session = await auth();
    const user = session?.user;

    return (
        <HydrateClient>
        <main className="min-h-screen bg-gradient-to-b from-[#c2c6ce] via-[#f3d8d3] to-[#c2c6ce] flex flex-col items-center justify-center text-white">
            <header className="absolute top-0 left-0 p-4 text-3xl text-black flex items-center gap-2">
                <Image src={logo} alt="Eltaria Logo" width={40} height={40}/>
                Eltaria
            </header>
            <SignInBtn/>
        </main>
        </HydrateClient>
    );
}
