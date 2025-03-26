import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
    createBaseAndTable: publicProcedure
    .input(
      z.object({
        user_id: z.number(),
        base_name: z.string().min(1),
        table_name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { user_id, base_name, table_name } = input;

      try {
        const [base_id] = await db.insert(bases).values({
            user_id: user_id,
            name: base_name,
        }).returning({id: bases.id})

        if (base_id?.id) {
            await db.insert(tables).values({
                base_id: base_id.id,
                name: table_name,
            })
        }
      } catch (error) {
        console.error("Error creating base and table:", error);
        throw new Error("Failed to create base and table");
      }
    }),
});