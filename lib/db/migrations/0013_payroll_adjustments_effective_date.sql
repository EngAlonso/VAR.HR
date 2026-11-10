ALTER TABLE "var_hr_payroll_adjustments"
  ALTER COLUMN "period_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "var_hr_payroll_adjustments"
  ADD COLUMN "effective_date" date;
