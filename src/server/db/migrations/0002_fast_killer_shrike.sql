ALTER TABLE "filter" RENAME TO "filters";--> statement-breakpoint
ALTER TABLE "filters" DROP CONSTRAINT "filter_view_id_views_id_fk";
--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "col_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "type" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "filters" ADD COLUMN "value" varchar;--> statement-breakpoint
ALTER TABLE "views" ADD COLUMN "filter_id" integer;--> statement-breakpoint
ALTER TABLE "filters" ADD CONSTRAINT "filters_col_id_columns_id_fk" FOREIGN KEY ("col_id") REFERENCES "public"."columns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "views" ADD CONSTRAINT "views_filter_id_filters_id_fk" FOREIGN KEY ("filter_id") REFERENCES "public"."filters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filters" DROP COLUMN "view_id";--> statement-breakpoint
ALTER TABLE "filters" DROP COLUMN "number_greater";--> statement-breakpoint
ALTER TABLE "filters" DROP COLUMN "number_target";--> statement-breakpoint
ALTER TABLE "filters" DROP COLUMN "text_filter";--> statement-breakpoint
ALTER TABLE "filters" DROP COLUMN "sort_asce";