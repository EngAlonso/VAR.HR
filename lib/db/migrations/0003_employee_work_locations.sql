CREATE TABLE IF NOT EXISTS "var_hr_employee_work_locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "work_date" date NOT NULL,
  "latitude" numeric(10, 7) NOT NULL,
  "longitude" numeric(10, 7) NOT NULL,
  "accuracy_meters" numeric(10, 2),
  "comment" text NOT NULL,
  "recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "var_hr_employee_work_locations" ADD CONSTRAINT "var_hr_employee_work_locations_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "var_hr_employee_work_locations" ADD CONSTRAINT "var_hr_employee_work_locations_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "var_hr_employee_work_locations_employee_date_idx" ON "var_hr_employee_work_locations" USING btree ("company_id", "employee_id", "work_date", "recorded_at");