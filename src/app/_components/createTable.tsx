"use client";
import { api } from "~/trpc/react";

interface CardProp {
  baseId: string,
  tableName: string,
  onCreate: () => void
}
export default function CreateTable({baseId, tableName, onCreate}:CardProp) {
  const createTable = api.create.createTable.useMutation();
  const tableCreate = async () => {

    try {
      const ret = await createTable.mutateAsync({
        base_id: baseId,
        table_name: tableName,
      });
      if (ret.success === 200) {
        onCreate()
      }
    } catch (error) {
      console.error("Failed to create base and table:", error);
    }
  };

  return (
    <button
        className="bg-blue-500 mt-3 text-white py-1 px-2 rounded-md hover:bg-blue-600"
      >
        +
    </button>
  );
}
