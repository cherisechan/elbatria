import { auth } from "~/auth";
import Image from "next/image";
import logo from "~/../public/logo.png";
import SignInBtn from "./_components/signInBtn";
import { redirect } from "next/navigation";
export default async function Landing() {

    const session = await auth();
    if (session) {
        redirect('/dashboard')
    }
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#c2c6ce] via-[#f3d8d3] to-[#c2c6ce] flex flex-col items-center justify-center text-white">
            <header className="absolute top-0 left-0 p-4 text-2xl text-black font-medium flex items-center gap-2">
                <Image src={logo} alt="Elbatria Logo" width={35} height={35} />
                Elbatria
            </header>
            <h1 className="text-black text-5xl font-semibold pb-2">Manage your data with Elbatria</h1>
            <p className="text-gray-600 text-xl font-light pb-7">Your go-to spreedsheet app</p>
            <SignInBtn />
        </main>
    );
}