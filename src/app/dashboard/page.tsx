import { redirect } from "next/navigation";
import { auth } from "~/auth";
import Image from "next/image";
import logo from "~/../public/logo.png";
import SignOutBtn from "../_components/signOutBtn";

export default async function Dashboard() {
    const session = await auth();
        if (!session) {
            console.log(session)
            redirect('/')
    }

    return (
        <main className="min-h-screen bg-white flex flex-col text-white">
            <header className="absolute h-[60px] top-0 left-0 w-full p-4 text-xl text-black font-medium flex items-center gap-2 border-b-1 border-gray-200">
                <Image src={logo} alt="Eltaria Logo" width={35} height={35} />
                Eltaria
                <SignOutBtn/>
            </header>
        </main>
    )
}