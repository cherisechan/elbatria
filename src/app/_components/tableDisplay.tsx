"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { api } from "~/trpc/react";

interface Prop {
  tableId: string;
}

type TableRow = Record<string, string | number | null>;

export default function DisplayTable({ tableId }: Prop) {
  const { data: columns } = api.base.getColumnsByTableId.useQuery({
    tableId,
  });

  const columnIds = useMemo(() => columns?.map((col) => col.id.toString()) ?? [], [columns]);

  const { data: cells } = api.base.getCellsByColumns.useQuery(
    { columnIds },
    { enabled: columnIds.length > 0 }
  );

  const rows = useMemo(() => {
    if (!columns || !cells) return [];

    const colMap = Object.fromEntries(columns.map((col) => [col.id, col.name]));
    const rowMap: Record<number, Record<string, string | number | null>> = {};

    for (const cell of cells) {
      const colName = colMap[cell.col_id];
      if (!colName) continue;

      const rowIndex = cell.row_index;
      if (!rowMap[rowIndex]) {
        rowMap[rowIndex] = { row_index: rowIndex };
      }

      rowMap[rowIndex][colName] = cell.text ?? cell.num ?? null;
    }

    return Object.values(rowMap);
  }, [columns, cells]);

  const tableColumns = useMemo<ColumnDef<TableRow>[]>(() => {
    return columns?.map((col) => ({
      accessorKey: col.name,
      header: col.name,
    })) ?? [];
  }, [columns]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <table className="min-w-full border overflow-auto">
      <thead className="bg-gray-100 border-1 border-gray-300">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} >
            {headerGroup.headers.map((header) => (
              <th key={header.id} style={{width:header.getSize()}} colSpan={header.colSpan} className="bg-gray-100 border-1 border-gray-300">
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell, cellIndex) => (
                <td key={cell.id} className="border-1 border-gray-300 ">
                    {cellIndex === 0 && (
                        <span className="text-gray-400 inline-block w-10 text-center">{row.index + 1}</span>
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
