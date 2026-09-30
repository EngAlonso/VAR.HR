ALTER TABLE "var_hr_employees"
  ADD COLUMN "automatic_annual_leave_eligible" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_employees"
  ADD COLUMN "automatic_annual_leave_activated_at" timestamp with time zone DEFAULT now();
--> statement-breakpoint
UPDATE "var_hr_employees"
SET
  "automatic_annual_leave_eligible" = true,
  "automatic_annual_leave_activated_at" = now();