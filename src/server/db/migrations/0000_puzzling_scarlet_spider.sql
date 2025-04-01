CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--> statement-breakpoint
CREATE TABLE "bases" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cells" (
	"id" serial PRIMARY KEY NOT NULL,
	"row_index" integer NOT NULL,
	"col_id" integer,
	"text" text,
	"num" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" uuid,
	"name" varchar NOT NULL,
	"data_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "filter" (
	"id" serial PRIMARY KEY NOT NULL,
	"view_id" serial NOT NULL,
	"number_greater" boolean,
	"number_target" integer,
	"text_filter" integer,
	"sort_asce" boolean
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"base_id" uuid,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" varchar NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "views" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" uuid NOT NULL,
	"name" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bases" ADD CONSTRAINT "bases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_col_id_columns_id_fk" FOREIGN KEY ("col_id") REFERENCES "public"."columns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "columns" ADD CONSTRAINT "columns_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filter" ADD CONSTRAINT "filter_view_id_views_id_fk" FOREIGN KEY ("view_id") REFERENCES "public"."views"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_base_id_bases_id_fk" FOREIGN KEY ("base_id") REFERENCES "public"."bases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;