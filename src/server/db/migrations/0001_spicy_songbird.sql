CREATE TABLE "rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer,
	"data" jsonb NOT NULL,
	"row_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "cells" CASCADE;--> statement-breakpoint
ALTER TABLE "columns" ADD COLUMN "data_type" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "rows" ADD CONSTRAINT "rows_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "columns" DROP COLUMN "is_num";