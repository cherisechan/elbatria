import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, columns, cells } from "~/server/db/schema";
import { desc, eq, inArray, and, or, ilike, sql, type SQL, isNull, isNotNull } from "drizzle-orm";

const filterSchema = z.object({
    columnId: z.number(),
    type: z.enum([
        "contains", "not_contains", "equal_text", "empty", "not_empty",
        "greater_than", "less_than", "equal_number"
    ]),
    value: z.string().optional(),
});

export const baseRouter = createTRPCRouter({
    getBases: publicProcedure
        .input(
            z.object({
                user_id: z.string(),
            })
        )
        .query(async ({ input }) => {
            const { user_id } = input;

            try {
                const userBases = await db
                    .select()
                    .from(bases)
                    .where(eq(bases.user_id, user_id))
                    .orderBy(desc(bases.created_at));

                return userBases;
            } catch (error) {
                console.error("Error fetching bases:", error);
                throw new Error("Failed to fetch bases");
            }
        }),

    getBaseById: publicProcedure
        .input(
            z.object({
                base_id: z.string(),
            })
        )
        .query(async ({ input }) => {
            const { base_id } = input;

            try {
                const base = await db
                    .select()
                    .from(bases)
                    .where(eq(bases.id, base_id));
                return base[0] ?? null;
            } catch (error) {
                console.error("Error fetching base by ID:", error);
                throw new Error("Failed to fetch base");
            }
        }),

    getTablesByBaseId: publicProcedure
        .input(z.object({ baseId: z.string() }))
        .query(async ({ input }) => {
            const { baseId } = input;
            const table_list = await db
                .select()
                .from(tables)
                .where(eq(tables.base_id, baseId));
            return table_list;
        }),

    getColumnsByTableId: publicProcedure
        .input(z.object({ tableId: z.string() }))
        .query(async ({ input }) => {
            const { tableId } = input;
            if (tableId === "") return [];
            return await db
                .select()
                .from(columns)
                .where(eq(columns.table_id, tableId))
                .orderBy(columns.id);
        }),

    getCellsByColumns: publicProcedure
    .input(z.object({
        columnIds: z.array(z.string()),
        sort: z.object({
            columnKey: z.string(),
            direction: z.enum(["asc", "desc"]),
        }).optional(),
        search: z.string().optional(),
        filters: z.array(filterSchema).optional(),
    }))
    .query(async ({ input }) => {
        const { columnIds, sort, search, filters } = input;
    
        if (!columnIds.length) return [];
    
        const numericIds = columnIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));
        const numAsText = sql`CAST(${cells.num} AS TEXT)`;
    
        const filterConditions:SQL[]= [inArray(cells.col_id, numericIds)];  
        if (search) {
            const adding = or(
                ilike(cells.text, `%${search}%`),
                ilike(numAsText, `%${search}%`)
            )
            if (adding) {
                filterConditions.push(adding)
            }
        }
    
        if (filters && filters.length > 0) {
            for (const filter of filters) {
                const { columnId, type, value } = filter;
            switch (type) {
                case "contains":
                    const adding1 = and(eq(cells.col_id, columnId), ilike(cells.text, `%${value}%`))
                    if (value && adding1) {
                        filterConditions.push(adding1);
                    }
                    break;
                case "not_contains":
                    const adding2 = and(eq(cells.col_id, columnId), sql`${cells.text} NOT ILIKE ${`%${value}%`}`);
                    if (value && adding2) {
                        filterConditions.push(adding2);
                    }
                    break;
                case "equal_text":
                    const adding3 = and(eq(cells.col_id, columnId), sql`${cells.text} ILIKE ${`%${value}%`}`);
                    if (value && adding3) {
                        filterConditions.push(adding3);
                    }
                    break;
                case "empty":
                    const adding4 = and(eq(cells.col_id, columnId), isNull(cells.text));
                    if (value && adding4) {
                        filterConditions.push(adding4);
                    }
                    break;
                case "not_empty":
                    const adding5 = and(eq(cells.col_id, columnId), isNotNull(cells.text));
                    if (value && adding5) {
                        filterConditions.push(adding5);
                    }
                    break;
                case "greater_than":
                    const adding6 = and(eq(cells.col_id, columnId), sql`${cells.num} > ${value}`)
                    if (value && adding6) {
                        filterConditions.push(adding6);
                    }
                    break;
                case "less_than":
                    const adding7 = and(eq(cells.col_id, columnId), sql`${cells.num} < ${value}`)
                    if (value && adding7) {
                        filterConditions.push(adding7);
                    }
                    break;
                case "equal_number":
                    const adding8 = and(eq(cells.col_id, columnId), sql`${cells.num} = ${value}`)
                    if (value && adding8) {
                        filterConditions.push(adding8);
                    }
                    break;
                }
            }
        }
    
        // Step 1: Find row_indices that match filters
        const matchingRowsQuery = db
            .selectDistinct({ row_index: cells.row_index })
            .from(cells)
            .where(and(...filterConditions));
    
        const matchingRowIndices = await matchingRowsQuery;
    
        const rowIndexSet = matchingRowIndices.map((r) => r.row_index);
    
        if (rowIndexSet.length === 0) return [];
    
        // Step 2: Get ALL cells from matching rows and the desired columns
        const whereClause = and(
            inArray(cells.col_id, numericIds),
            inArray(cells.row_index, rowIndexSet)
        );
    
        let ordering: SQL[] = [sql`${cells.row_index}`];
        if (sort) {
            const colId = parseInt(sort.columnKey);
            if (!isNaN(colId)) {
            ordering = [
                sql.raw(`CASE WHEN "col_id" = ${colId} THEN 0 ELSE 1 END`),
                sort.direction === "asc"
                ? sql.raw(`"text" ASC NULLS LAST, "num" ASC NULLS LAST`)
                : sql.raw(`"text" DESC NULLS FIRST, "num" DESC NULLS FIRST`),
                sql`${cells.row_index}`,
            ];
            }
        }
    
        return await db
            .select()
            .from(cells)
            .where(whereClause)
            .orderBy(...ordering);
        }),
          
    
    updateCell: publicProcedure
        .input(z.object({
            colId: z.number(),
            rowIndex: z.number(),
            value: z.union([z.string(), z.number(), z.null()]),
        }))
        .mutation(async ({ input }) => {
            const { colId, rowIndex, value } = input;

            const existing = await db
                .select()
                .from(cells)
                .where(and(eq(cells.col_id, colId), eq(cells.row_index, rowIndex)));

            if (existing.length > 0) {
                await db
                    .update(cells)
                    .set({
                        text: typeof value === "string" ? value : null,
                        num: typeof value === "number" ? value.toString() : null,
                    })
                    .where(and(eq(cells.col_id, colId), eq(cells.row_index, rowIndex)));
            } else {
                await db.insert(cells).values({
                    col_id: colId,
                    row_index: rowIndex,
                    text: typeof value === "string" ? value : null,
                    num: typeof value === "number" ? value.toString() : null,
                });
            }
            return { success: true };
        }),

    updateCol: publicProcedure
        .input(z.object({
            tableId: z.string(),
            colId: z.number(),
            value: z.string(),
        }))
        .mutation(async ({ input }) => {
            const { colId, tableId, value } = input;

            await db
                .update(columns)
                .set({
                    name: value,
                })
                .where(and(eq(columns.table_id, tableId), eq(columns.id, colId)));

            return { success: true };
        }),
    
});
