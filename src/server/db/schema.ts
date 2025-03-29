// import { relations, sql } from "drizzle-orm";
// import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
// import { type AdapterAccount } from "next-auth/adapters";

// /**
//  * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
//  * database instance for multiple projects.
//  *
//  * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
//  */
// export const createTable = pgTableCreator((name) => `elbatria_${name}`);

// export const posts = createTable(
//   "post",
//   (d) => ({
//     id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
//     name: d.varchar({ length: 256 }),
//     createdById: d
//       .varchar({ length: 255 })
//       .notNull()
//       .references(() => users.id),
//     createdAt: d
//       .timestamp({ withTimezone: true })
//       .default(sql`CURRENT_TIMESTAMP`)
//       .notNull(),
//     updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
//   }),
//   (t) => [
//     index("created_by_idx").on(t.createdById),
//     index("name_idx").on(t.name),
//   ]
// );

// export const users = createTable("user", (d) => ({
//   id: d
//     .varchar({ length: 255 })
//     .notNull()
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   name: d.varchar({ length: 255 }),
//   email: d.varchar({ length: 255 }).notNull(),
//   emailVerified: d
//     .timestamp({
//       mode: "date",
//       withTimezone: true,
//     })
//     .default(sql`CURRENT_TIMESTAMP`),
//   image: d.varchar({ length: 255 }),
// }));

// export const usersRelations = relations(users, ({ many }) => ({
//   accounts: many(accounts),
// }));

// export const accounts = createTable(
//   "account",
//   (d) => ({
//     userId: d
//       .varchar({ length: 255 })
//       .notNull()
//       .references(() => users.id),
//     type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
//     provider: d.varchar({ length: 255 }).notNull(),
//     providerAccountId: d.varchar({ length: 255 }).notNull(),
//     refresh_token: d.text(),
//     access_token: d.text(),
//     expires_at: d.integer(),
//     token_type: d.varchar({ length: 255 }),
//     scope: d.varchar({ length: 255 }),
//     id_token: d.text(),
//     session_state: d.varchar({ length: 255 }),
//   }),
//   (t) => [
//     primaryKey({ columns: [t.provider, t.providerAccountId] }),
//     index("account_user_id_idx").on(t.userId),
//   ]
// );

// export const accountsRelations = relations(accounts, ({ one }) => ({
//   user: one(users, { fields: [accounts.userId], references: [users.id] }),
// }));

// export const sessions = createTable(
//   "session",
//   (d) => ({
//     sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
//     userId: d
//       .varchar({ length: 255 })
//       .notNull()
//       .references(() => users.id),
//     expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
//   }),
//   (t) => [index("t_user_id_idx").on(t.userId)]
// );

// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   user: one(users, { fields: [sessions.userId], references: [users.id] }),
// }));

// export const verificationTokens = createTable(
//   "verification_token",
//   (d) => ({
//     identifier: d.varchar({ length: 255 }).notNull(),
//     token: d.varchar({ length: 255 }).notNull(),
//     expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
//   }),
//   (t) => [primaryKey({ columns: [t.identifier, t.token] })]
// );




import { pgTable, serial, varchar, boolean, timestamp, integer, uuid, jsonb } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().default("uuid_generate_v4()"),
    email: varchar("email").unique().notNull()
})

export const bases = pgTable('bases', {
    id: uuid("id").primaryKey().default("uuid_generate_v4()"),
    user_id: uuid('user_id').references(() => users.id),
    name: varchar('name').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const tables = pgTable('tables', {
    id: uuid("id").primaryKey().default("uuid_generate_v4()"),
    base_id: uuid('base_id').references(() => bases.id),
    name: varchar('name').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const columns = pgTable('columns', {
    id: serial('id').primaryKey(),
    table_id: uuid('table_id').references(() => tables.id),
    name: varchar('name').notNull(),
    data_type: varchar('data_type').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const rows = pgTable('rows', {
    id: serial('id').primaryKey(),
    table_id: uuid('table_id').references(() => tables.id),
    data: jsonb('data').notNull(),
    row_index: integer('row_index').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const views = pgTable('views', {
    id: serial('id').primaryKey(),
    table_id: uuid('table_id').notNull().references(() => tables.id),
    name: varchar('name').notNull(),
});

export const filter = pgTable('filter', {
    id: serial('id').primaryKey(),
    view_id: serial('view_id').notNull().references(() => views.id),
    number_greater: boolean('number_greater'),
    number_target: integer('number_target'),
    text_filter: integer('text_filter'),
    sort_asce: boolean('sort_asce')
});


// relationships  
export const userRelations = relations(users, ({ many }) => ({
    bases: many(bases),
}));

export const baseRelations = relations(bases, ({ many, one }) => ({
    user: one(users),
    tables: many(tables),
}));

export const tableRelations = relations(tables, ({ many, one }) => ({
    base: one(bases),
    columns: many(columns), 
    views: many(views),
}));

export const columnRelations = relations(columns, ({ one }) => ({
    table: one(tables),
}));

export const rowRelations = relations(rows, ({ one }) => ({
    table: one(tables),
}))

export const viewRelations = relations(views, ({ many, one }) => ({
    table: one(tables), 
    filters: many(filter),
}));

export const filterRelations = relations(filter, ({ one }) => ({
    view: one(views),
}));