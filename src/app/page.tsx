import { auth } from "~/auth";
import Image from "next/image";
import logo from "~/../public/logo.png";
import SignInBtn from "./_components/signInBtn";
import { redirect } from "next/navigation";
export default async function Landing() {

    const session = await auth();
    if (session) {
        console.log(session)
        redirect('/dashboard')
    }
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#c2c6ce] via-[#f3d8d3] to-[#c2c6ce] flex flex-col items-center justify-center text-white">
            <header className="absolute top-0 left-0 p-4 text-3xl text-black flex items-center gap-2">
                <Image src={logo} alt="Eltaria Logo" width={40} height={40} />
                Eltaria
            </header>
            <SignInBtn />
        </main>
    );
}