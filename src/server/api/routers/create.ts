import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { bases, tables, columns, cells } from "~/server/db/schema";
import { faker } from '@faker-js/faker';

export const createRouter = createTRPCRouter({
    createBaseAndTable: publicProcedure
    .input(
      z.object({
        user_id: z.string(),
        base_name: z.string().min(1),
        table_name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { user_id, base_name, table_name } = input;

      try {
        // create base
        const [base_id] = await db.insert(bases).values({
            user_id: user_id,
            name: base_name,
        }).returning({id: bases.id})

        if (!base_id?.id) {
          throw new Error("Failed to create base");
        }

        // create table
        const [table_id] = await db.insert(tables).values({
          base_id: base_id.id,
          name: table_name,
        }).returning({ id: tables.id });

        if (!table_id?.id) {
          throw new Error("Failed to create table");
        }

        // create columns
        const [text_column_id, num_column_id] = await db
          .insert(columns)
          .values([
            { table_id: table_id.id, name: "Text Column", data_type: "text" },
            { table_id: table_id.id, name: "Number Column", data_type: "number" },
          ])
          .returning({ id: columns.id });

        if (!text_column_id?.id || !num_column_id?.id) {
          throw new Error("Column creation failed");
        }

        // create rows with Faker.js data
        const rowsData = Array.from({ length: 5 }, (_, index) => ({
          table_id: table_id.id,
          row_index: index + 1,
        }));
        
        for (const rowData of rowsData) {
          await db.insert(cells).values([
            {
              row_index: rowData.row_index,
              col_id: text_column_id.id,
              text: faker.lorem.words(3),
            },
            {
              row_index: rowData.row_index,
              col_id: num_column_id.id,
              num: faker.number.float({ min: 1, max: 100 }).toString(), 
            },
          ]);
        }
        return { success: 200, base_id: base_id.id};
      } catch (error) {
        console.error("Error creating base and table:", error);
        throw new Error("Failed to create base and table");
      }
    }),

    createTable: publicProcedure
    .input(
        z.object({
        base_id: z.string(),
        table_name: z.string().min(1),
        })
    )
    .mutation(async ({ input }) => {
        const { base_id, table_name } = input;

        try {
        // create table
        const [table] = await db.insert(tables).values({
            base_id,
            name: table_name,
        }).returning({ id: tables.id });

        if (!table?.id) {
            throw new Error("Failed to create table");
        }

        // create default columns
        const [text_column_id, num_column_id] = await db
            .insert(columns)
            .values([
            { table_id: table.id, name: "Text Column", data_type: "text" },
            { table_id: table.id, name: "Number Column", data_type: "number" },
            ])
            .returning({ id: columns.id });

        if (!text_column_id?.id || !num_column_id?.id) {
            throw new Error("Failed to create columns");
        }

        // create rows with Faker.js data (optional)
        const rowsData = Array.from({ length: 5 }, (_, index) => ({
            table_id: table.id,
            row_index: index + 1,
        }));

        for (const rowData of rowsData) {
            await db.insert(cells).values([
            {
                row_index: rowData.row_index,
                col_id: text_column_id.id,
                text: faker.lorem.words(3),
            },
            {
                row_index: rowData.row_index,
                col_id: num_column_id.id,
                num: faker.number.float({ min: 1, max: 100 }).toString(),
            },
            ]);
        }

        return { success: 200, table_id: table.id };
        } catch (error) {
        console.error("Error creating table:", error);
        throw new Error("Failed to create table");
        }
    }),

    createColumn: publicProcedure
    .input(
        z.object({
            table_id: z.string().min(1),
            name: z.string(),
            data_type: z.string(),
        })
    )
    .mutation(async ({ input }) => {
        const { table_id, name, data_type } = input;

        try {
        // create table
        const [column] = await db.insert(columns).values({
            table_id,
            name,
            data_type,
        }).returning({ id: columns.id });

        if (!column?.id) {
            throw new Error("Failed to create column")
        }

        return { success: 200, column_id: column.id };
        } catch (error) {
        console.error("Error creating table:", error);
        throw new Error("Failed to create table");
        }
    }),
});