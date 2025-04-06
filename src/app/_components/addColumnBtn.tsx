"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface Props {
    tableId: string;
}

export default function AddColumnButton({ tableId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState<"text" | "number">("text");

    const utils = api.useUtils();

    const createColumn = api.create.createColumn.useMutation({
        onSuccess: () => {
            void utils.base.getColumnsByTableId.invalidate({ tableId });
            setIsOpen(false);
            setName("");
            setType("text");
        },
    });

    return (
        <div className="relative w-full h-full">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full h-full px-2"
            >
                +
            </button>

            {isOpen && (
                <div className="absolute right-[-10px] mr-2 top-7 bg-white border border-gray-300 rounded-md p-3 w-64 z-50">
                    <label className="block mb-1 text-sm font-medium">Column Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-2 py-1 rounded mb-2 font-medium"
                        placeholder=""
                    />

                    <label className="block mb-1 text-sm font-medium">Data Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as "text" | "number")}
                        className="w-full border px-2 py-1 rounded mb-3 font-light"
                    >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                    </select>

                    <div className="flex justify-between">
                        <button
                            className="text-sm text-gray-500 hover:text-gray-600"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            onClick={() => {
                                if (name.trim()) {
                                    createColumn.mutate({ table_id: tableId, name: name.trim(), data_type: type });
                                }
                            }}
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
