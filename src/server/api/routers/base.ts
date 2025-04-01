import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, columns, cells } from "~/server/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

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
        const userBases = await db.select().from(bases).where(eq(bases.user_id, user_id)).orderBy(desc(bases.created_at));
        
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

      // Assuming `id` is unique, return the first (and only) result
      return base[0] || null;
    } catch (error) {
      console.error("Error fetching base by ID:", error);
      throw new Error("Failed to fetch base");
    }
  }),

  getTablesByBaseId: publicProcedure
  .input(z.object({ baseId: z.string() }))
  .query(async ({ input }) => {
    const { baseId } = input;
    const table_list = await db.select().from(tables).where(eq(tables.base_id,baseId));
    return table_list;
  }),

  getColumnsByTableId: publicProcedure
  .input(z.object({ tableId: z.string() }))
  .query(async ({ input }) => {
    const { tableId } = input;
    return await db.select().from(columns).where(eq(columns.table_id, tableId)).orderBy(bases.created_at);
  }),

  getCellsByColumns: publicProcedure
  .input(z.object({ columnIds: z.array(z.string()) })) // Accept an array of column IDs
  .query(async ({ input }) => {
    const { columnIds } = input;
    return await db
      .select()
      .from(cells)
      .where(inArray(cells.col_id, columnIds.map(id => parseInt(id)))) 
      .orderBy(cells.row_index); 
  }),
    
});
