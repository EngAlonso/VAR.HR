ALTER TABLE "var_hr_companies" ADD COLUMN "name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_departments" ADD COLUMN "name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_branches" ADD COLUMN "name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD COLUMN "first_name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD COLUMN "last_name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_user_accounts" ADD COLUMN "full_name_en" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_work_schedules" ADD COLUMN "name_en" text DEFAULT '' NOT NULL;