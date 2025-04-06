"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type Props = {
    tableId: string;
    refetch: () => void;
};

export default function AddRowBtn({ tableId, refetch }: Props) {
    const [loading, setLoading] = useState(false);

    const createRow = api.create.addRow.useMutation({
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: () => {
            refetch();
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    const handleAddRow = () => {
        if (!loading) {
            createRow.mutate({ tableId });
        }
    };

    return (
        <button
            onClick={handleAddRow}
            disabled={loading}
        >
            {loading ? <span className="loading loading-dots loading-xs"></span> : "+"}
        </button>
    );
}
