import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

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
});
