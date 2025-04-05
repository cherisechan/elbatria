"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { TiSortAlphabetically } from "react-icons/ti";
import { MdNumbers } from "react-icons/md";

interface Prop {
  tableId: string;
}

type TableRow = Record<string, string | number | null>;

type MyColumnMeta = {
  datatype: string;
  colId: number;
};

export default function DisplayTable({ tableId }: Prop) {
  const { data: columns } = api.base.getColumnsByTableId.useQuery({ tableId });
  const [columnSizing, setColumnSizing] = useState({});

  const columnIds = useMemo(
    () => columns?.map((col) => col.id.toString()) ?? [],
    [columns]
  );

  const { data: cells } = api.base.getCellsByColumns.useQuery(
    { columnIds },
    { enabled: columnIds.length > 0 }
  );

  const rows = useMemo(() => {
    if (!columns || !cells) return [];

    const colMap = Object.fromEntries(columns.map((col) => [col.id, col.name]));
    const rowMap: Record<number, TableRow> = {};

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

  const utils = api.useUtils();

  const updateCell = api.base.updateCell.useMutation({
    onMutate: async (newCell) => {
      const previousData = utils.base.getCellsByColumns.getData();

      utils.base.getCellsByColumns.setData({ columnIds }, (old) => {
        if (!old) return old;
        return old.map((cell) =>
          cell.col_id === newCell.colId && cell.row_index === newCell.rowIndex
            ? {
                ...cell,
                text: typeof newCell.value === "string" ? newCell.value : null,
                num: typeof newCell.value === "number" ? String(newCell.value) : null,
              }
            : cell
        );
      });

      return { previousData };
    },
    onError: (_err, _newCell, context) => {
      utils.base.getCellsByColumns.setData({ columnIds }, context?.previousData);
    },
    onSettled: () => {
      void utils.base.getCellsByColumns.invalidate();
    },
  });

  const tableColumns = useMemo<ColumnDef<TableRow>[]>(() => {
    return (
      columns?.map((col) => ({
        id: col.id.toString(),
        accessorKey: col.name,
        header: col.name,
        meta: {
          datatype: col.data_type,
          colId: col.id,
        },
        size: 150,
        minSize: 50,
        maxSize: 500,
        cell: ({ row, column }) => {
          const isNumber = col?.data_type === "number";
          const value = row.getValue(column.id);
          const rowIndexFromDB = row.original.row_index;
          if (rowIndexFromDB === undefined || rowIndexFromDB === null) return null;

          return (
            <input
              type={isNumber ? "number" : "text"}
              defaultValue={value as string}
              className="w-full h-full p-1 bg-white"
              onBlur={(e) => {
                const newValue = e.target.value;
                if (newValue !== value) {
                  updateCell.mutate({
                    tableId,
                    colId: col.id,
                    rowIndex:
                      typeof rowIndexFromDB === "string"
                        ? parseInt(rowIndexFromDB)
                        : rowIndexFromDB,
                    value: isNumber ? parseFloat(newValue) : newValue,
                  });
                }
              }}
            />
          );
        },
      })) ?? []
    );
  }, [columns, updateCell, tableId]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
  });

  return (
    <div className="overflow-auto">
      <table className="table-fixed border border-collapse">
        <thead className="bg-gray-100 border">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as MyColumnMeta | undefined;
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      position: "relative",
                    }}
                    className="border border-gray-300"
                  >
                    {!header.isPlaceholder && (
                      <div className="relative w-full h-full flex items-center gap-2 px-1">
                        {meta?.datatype === "number" && <MdNumbers className="text-gray-500 h-full" size={20} />}
                        {meta?.datatype === "text" && <TiSortAlphabetically className="text-gray-500 h-full" size={20}/>}
                        <input
                          defaultValue={String(header.column.columnDef.header)}
                          className="bg-gray-100 w-full px-1 py-0.5 font-semibold"
                          onBlur={(e) => {
                            const newValue = e.target.value;
                            const columnId = header.column.id;
                            // TODO: Call updateColumnName mutation here
                            console.log("Rename column", columnId, "→", newValue);
                          }}
                        />
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none
                              ${
                                header.column.getIsResizing()
                                  ? "bg-blue-500 opacity-100"
                                  : "bg-gray-500 opacity-0 hover:opacity-100"
                              }`}
                          />
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  style={{ width: cell.column.getSize() }}
                  className="border border-gray-300"
                >
                  <div className="flex items-center gap-2">
                    {cellIndex === 0 && (
                      <span className="text-gray-400 w-10 text-center">
                        {row.index + 1}
                      </span>
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
