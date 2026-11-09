ALTER TABLE "var_hr_employees" ADD COLUMN "attendance_location_mode" text NOT NULL DEFAULT 'fixed';
--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD CONSTRAINT "var_hr_employees_attendance_location_mode_chk" CHECK ("var_hr_employees"."attendance_location_mode" IN ('fixed', 'variable'));
