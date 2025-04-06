"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { FaFilter } from "react-icons/fa";

interface Props {
    tableId: string;
    onFilter: (filter: FilterPayload) => void;
}

type FilterPayload = {
    columnId: number;
    type: "text" | "number";
    condition: string;
    value?: string | number;
};

export default function FilterBtn({ tableId, onFilter }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [columnId, setColumnId] = useState<number | null>(null);
    const [dataType, setDataType] = useState<"text" | "number" | null>(null);
    const [condition, setCondition] = useState("");
    const [value, setValue] = useState("");

    const { data: columns } = api.base.getColumnsByTableId.useQuery({ tableId });

    const selectedCol = columns?.find((col) => col.id === columnId);

    const textConditions = ["is empty", "is not empty", "contains", "not contains", "equals"];
    const numberConditions = ["greater than", "less than", "equals"];

    const handleApply = () => {
        if (!columnId || !dataType || !condition) return;

        onFilter({
            columnId,
            type: dataType,
            condition,
            value: value || undefined,
        });

        setIsOpen(false);
        setCondition("");
        setValue("");
    };

    return (
        <div className=" ml-4 h-full rounded-md bg-gray-100 hover:bg-gray-300 relative">
            <button
                className="w-full rounded-md h-full px-2 bg-gray-100 hover:bg-gray-300 text-center"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <FaFilter />
            </button>

            {isOpen && (
                <div className="absolute left-1/2 top-11 transform -translate-x-1/2 bg-white border border-gray-300 rounded-md p-3 w-72 z-50">
                    <label className="block mb-1 text-sm font-medium">Column</label>
                    <select
                        className="w-full border px-2 py-1 rounded mb-3"
                        value={columnId ?? ""}
                        onChange={(e) => {
                            const id = parseInt(e.target.value);
                            const col = columns?.find((c) => c.id === id);
                            setColumnId(id);
                            setDataType(col?.data_type === "number" ? "number" : "text");
                            setCondition("");
                            setValue("");
                        }}
                    >
                        <option value="">Select column</option>
                        {columns?.map((col) => (
                            <option key={col.id} value={col.id}>
                                {col.name}
                            </option>
                        ))}
                    </select>

                    {dataType && (
                        <>
                            <label className="block mb-1 text-sm font-medium">Condition</label>
                            <select
                                className="w-full border px-2 py-1 rounded mb-3"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                            >
                                <option value="">Select condition</option>
                                {(dataType === "text" ? textConditions : numberConditions).map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>

                            {!(condition.includes("empty")) && (
                                <>
                                    <label className="block mb-1 text-sm font-medium">Value</label>
                                    <input
                                        type={dataType === "number" ? "number" : "text"}
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        className="w-full border px-2 py-1 rounded mb-3"
                                    />
                                </>
                            )}
                        </>
                    )}

                    <div className="flex justify-between">
                        <button
                            className="text-sm text-gray-500 hover:text-gray-600"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            onClick={handleApply}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
