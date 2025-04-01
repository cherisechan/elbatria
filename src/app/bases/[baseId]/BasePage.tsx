"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "~/../public/logo.png";
import DisplayTable from "~/app/_components/tableDisplay";
type Props = {
  baseId: string;
  userId: string;
};

export default function BasePage({ baseId, userId }: Props) {
    const router = useRouter();
    const [onTable, setOnTable] = useState(0);
    const [onTableId, setOnTableId] = useState("")
    const [loadingTables, setLoadingTables] = useState(false);
    const createTable = api.create.createTable.useMutation();
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
        refetch: refetchTables
    } = api.base.getTablesByBaseId.useQuery(
        { baseId },
        { enabled: !!base }
    );

    // default table id is table 0
    useEffect(() => {
        if (tables?.[0]) {
          setOnTableId(tables[0].id);
        }
    }, [tables]);


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
        setLoadingTables(true);
        const tableCreate = async () => {
            
            try {
                if (tables === undefined) {
                    return;
                }
                const tableName = (tables?.length ?? 0) >= 1 ? `Table ${tables.length + 1}` : "Table 1"
                const ret = await createTable.mutateAsync({
                    base_id: baseId,
                    table_name: tableName,
                });
                if (ret.success === 200) {
                    void refetchTables();
                    setLoadingTables(false);
                }
            } catch (error) {
            console.error("Failed to create base and table:", error);
            }
        };
        void tableCreate();
    }

    return (<>
        <nav className="flex items-center flex-col bg-[#3a66a3]">
            <div className="font-semibold text-lg text-white flex w-full px-6 py-4 justify-start gap-2"> 
                <Image src={logo} alt="Elbatria" className="w-5 h-5 self-center" onClick={() => router.push('/dashboard')} />
                <p>{base.name}</p>
            </div>

            <div className="flex w-full overflow-x-auto bg-[#345c91] pl-3 ">
                {tables && tables.length > 0 ? (
                    <>
                        {tables.map((table, index) => (
                            <div
                            key={table.id}
                            onClick={() => {setOnTable(index); setOnTableId(table.id)}}
                            className={`
                                relative px-4 py-1.5 rounded-t-md text-[13px] font-medium cursor-pointer whitespace-nowrap
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
                        {
                            loadingTables ? (
                                <span className="loading bg-white loading-spinner loading-md"></span>
                            ): (
                                <button
                                    onClick={() => handleCreateTable()}
                                    className="relative px-3 py-1.5 rounded-t-md text-sm font-bold text-white hover:bg-[#2e4f7f] bg-transparent"
                                >
                                    +
                                    <div className="absolute right-0 top-1/4 h-1/2 w-px bg-[#446799]" />
                                </button>
                            )
                        }
                    </>
                ) : (
                    <span className="text-sm text-gray-500">No tables</span>
                )}
            </div>

        </nav>
        <div className="p-3">
            <DisplayTable tableId={onTableId}/>
        </div>
    </>);
}
