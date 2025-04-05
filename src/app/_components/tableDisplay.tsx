"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  getFilteredRowModel,
  type FilterFn,
} from "@tanstack/react-table";
import { rankItem } from '@tanstack/match-sorter-utils'
import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { TiSortAlphabetically } from "react-icons/ti";
import { MdNumbers } from "react-icons/md";
import AddRowBtn from "./addRowBtn";
import AddColumnButton from "./addColumnBtn";
import { IoIosSearch } from "react-icons/io";
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
    const [columnFilters, setColumnFilters] = useState<string[]>([]);
    const columnIds = useMemo(
        () => columns?.map((col) => col.id.toString()) ?? [],
        [columns]
    );

    const { data: cells, refetch: refetchCells } = api.base.getCellsByColumns.useQuery(
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

    const updateCol = api.base.updateCol.useMutation({
        onMutate: async (newCol) => {
            const previousData = utils.base.getColumnsByTableId.getData({ tableId });
    
            utils.base.getColumnsByTableId.setData({ tableId }, (old) => {
                if (!old) return old;
                return old.map((col) =>
                    col.id === newCol.colId
                        ? {
                            ...col,
                            name: newCol.value,
                        }
                        : col
                );
            });
    
            return { previousData };
        },
    
        onError: (_err, _newCol, context) => {
            utils.base.getColumnsByTableId.setData({ tableId }, context?.previousData);
        },
    
        onSettled: () => {
            void utils.base.getColumnsByTableId.invalidate({ tableId });
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
                        const raw = e.target.value.trim(); // Always a string
                        let newValue: string | number | null = null;
                    
                        if (isNumber) {
                            if (raw === "") {
                                newValue = null;
                            } else {
                                const parsed = parseFloat(raw); // raw is string here
                                if (!isNaN(parsed)) {
                                    newValue = parsed;
                                } else {
                                    return; // Prevent sending NaN
                                }
                            }
                        } else {
                            newValue = raw === "" ? null : raw;
                        }
                    
                        if (newValue !== value) {
                            updateCell.mutate({
                                tableId,
                                colId: col.id,
                                rowIndex:
                                    typeof rowIndexFromDB === "string"
                                        ? parseInt(rowIndexFromDB)
                                        : rowIndexFromDB,
                                value: newValue,
                            });
                        }
                    }}                    
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault(); 
                            (e.target as HTMLInputElement).blur();
                        }
                    }}
                />
            );
            },
        })) ?? []
        );
    }, [columns, updateCell, tableId]);

    const fuzzyFilter: FilterFn<TableRow> = (row, columnId, value, addMeta) => {
        const item = String(row.getValue(columnId) ?? "");
        const search = String(value ?? "");

        const itemRank = rankItem(item, search);
        addMeta?.({ itemRank });
        return itemRank.passed;
    }
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
        getFilteredRowModel: getFilteredRowModel(),
        filterFns: {
            fuzzy: fuzzyFilter
        },
        globalFilterFn: fuzzyFilter,
        onColumnSizingChange: setColumnSizing,
    });

    return (
        <div className="overflow-visible h-full">
             <div className="max-w-[12rem] relative my-2">
                <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
                    <IoIosSearch />
                </span>
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-8 pr-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={e => table.setGlobalFilter(e.target.value)}
                />
            </div>
            <table className="table-fixed border-collapse">
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
                                                defaultValue={columns?.find((col) => col.id.toString() === header.column.id)?.name ?? ""}
                                                className="bg-gray-100 w-full px-1 py-0.5 font-semibold"
                                                onBlur={(e) => {
                                                    const newValue = e.target.value.trim();
                                                    const oldValue = columns?.find((col) => col.id === meta?.colId)?.name;
                                                    
                                                    if (meta?.colId && newValue && newValue !== oldValue) {
                                                        updateCol.mutate({
                                                            tableId,
                                                            colId: meta.colId,
                                                            value: newValue,
                                                        });
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        (e.target as HTMLInputElement).blur();
                                                    }
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
                        <th className="border border-gray-300 px-2 hover:bg-gray-300">
                            <AddColumnButton tableId={tableId}></AddColumnButton>
                        </th>
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
                <tr>
                    <td className="text-gray-400 pl-2 text-lg border border-gray-300 w-10">
                        <AddRowBtn tableId={tableId} refetch={refetchCells} />
                    </td>
                    <td colSpan={table.getAllLeafColumns().length - 1} className="border border-gray-300">
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}
