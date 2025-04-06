import { z } from "zod";
import {
    createTRPCRouter,
    publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, columns, cells } from "~/server/db/schema";
import { desc, eq, inArray, and, or, ilike, sql, type SQL } from "drizzle-orm";

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
            filter: z.object({
                search: z.string().optional(),
            }).optional(),
        }))
        .query(async ({ input }) => {
            const { columnIds, filter, sort } = input;
        
            if (!columnIds.length) return [];
        
            const numericIds = columnIds
                .map((id) => parseInt(id))
                .filter((id) => !isNaN(id));
        
            const search = filter?.search?.trim();
        
            const numAsText = sql`CAST(${cells.num} AS TEXT)`;

            let ordering: SQL[] = [sql`${cells.row_index}`];

            if (sort) {
              const colId = sort.columnKey
              if (colId) {
                ordering = [
                  sql.raw(
                    `CASE WHEN "col_id" = ${colId} THEN 0 ELSE 1 END`,
                  ),
                  sort.direction === "asc"
                    ? sql.raw(`"text" ASC NULLS LAST, "num" ASC NULLS LAST`)
                    : sql.raw(`"text" DESC NULLS FIRST, "num" DESC NULLS FIRST`),
                    sql`${cells.row_index}`,
                ];
              }
            }
        
            return await db.select().from(cells).where(
              and(
                inArray(cells.col_id, numericIds),
                search
                  ? or(
                      ilike(cells.text, `%${search}%`),
                      ilike(numAsText, `%${search}%`)
                    )
                  : undefined
              )
            ).orderBy(...ordering);
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
