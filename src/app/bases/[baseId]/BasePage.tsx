"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "~/../public/logo.png";
type Props = {
  baseId: string;
  userId: string;
};

export default function BasePage({ baseId, userId }: Props) {
    const router = useRouter();
    const [onTable, setOnTable] = useState(0);

    //fetch base
    const {
        data: base,
        isLoading: isBaseLoading,
        error: baseError,
    } = api.base.getBaseById.useQuery(
        { base_id: baseId },
        { enabled: !!baseId }
    );

    //fetch tables 
    const {
        data: tables,
        isLoading: isTablesLoading,
        error: tablesError,
    } = api.base.getTablesByBaseId.useQuery(
        { baseId },
        { enabled: !!base }
    );

    // check if user owns the base
    useEffect(() => {
        if (base && userId && base.user_id !== userId) {
        alert("You don't have access");
        router.push("/dashboard");
        }
    }, [base, userId, router]);

    if (isBaseLoading || isTablesLoading) return <div>Loading...</div>;
    if (baseError || tablesError)
        return (
        <div>
            Error loading page
        </div>
        );
    if (!base) return <div>Base not found.</div>;

    const handleCreateTable = () => {
        console.log("hi");
    }

    return (<>
        <nav className="flex items-center flex-col bg-[#3a66a3]">
            <div className="font-semibold text-lg text-white flex w-full px-6 py-4 justify-start gap-2"> 
                <Image src={logo} alt="Elbatria" className="w-5 h-5 self-center" />
                <p>{base.name}</p>
            </div>

            <div className="flex w-full overflow-x-auto bg-[#345c91] pl-3 ">
                {tables && tables.length > 0 ? (
                    <>
                        {tables.map((table, index) => (
                            <div
                            key={table.id}
                            onClick={() => setOnTable(index)}
                            className={`
                                relative px-4 py-1.5 rounded-t-md text-[13px] font-medium cursor-pointer
                                ${onTable === index ? "bg-white text-black" : "hover:bg-[#2e4f7f] text-white"}
                            `}
                            >
                            {table.name}
                            {
                                onTable !== index && 
                                <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#446799]" />
                            }
                            </div>
                        ))}

                        <button
                            onClick={() => handleCreateTable()}
                            className="relative px-3 py-1.5 rounded-t-md text-sm font-bold text-white hover:bg-[#2e4f7f] bg-transparent"
                        >
                            +
                            <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#446799]" />
                        </button>
                    </>
                ) : (
                    <span className="text-sm text-gray-500">No tables</span>
                )}
            </div>

        </nav>
        
    </>);
}
