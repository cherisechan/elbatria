// import { drizzle } from "drizzle-orm/neon-http";
// import { config } from "dotenv";
// import { neon } from "@neondatabase/serverless";

// config({ path: ".env.local" });

// const sql =  neon(process.env.DATABASE_URL!);
// const db = drizzle(sql);

// export { db };

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { schema } from './schema'; 
config({ path: ".env" }); // or .env.local
const sql = neon(process.env.DATABASE_URL!);
export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema"; // Import all your tables

// // Connect to your database
// const client = postgres({
//   host: "localhost",
//   user: "your_username",
//   password: "your_password",
//   database: "your_database",
// });

// // Initialize Drizzle with the schema
// export const db = drizzle(client, { schema });
