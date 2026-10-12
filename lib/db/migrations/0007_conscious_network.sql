CREATE TABLE "var_hr_backup_scheduler_status" (
	"target_key" text PRIMARY KEY NOT NULL,
	"run_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"company_id" uuid,
	"company_name" text,
	"company_name_en" text,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"reason" text,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"backups_created" integer DEFAULT 0 NOT NULL,
	"platform_created" integer DEFAULT 0 NOT NULL,
	"company_created" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"drive_uploaded" integer DEFAULT 0 NOT NULL,
	"drive_failed" integer DEFAULT 0 NOT NULL,
	"drive_pending" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "var_hr_backup_scheduler_status" ADD CONSTRAINT "var_hr_backup_scheduler_status_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "var_hr_backup_scheduler_status_type_idx" ON "var_hr_backup_scheduler_status" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "var_hr_backup_scheduler_status_company_idx" ON "var_hr_backup_scheduler_status" USING btree ("company_id");