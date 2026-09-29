ALTER TABLE "var_hr_employees" ADD COLUMN "location_attendance_enabled" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "var_hr_attendance_punch_requests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "company_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "attendance_date" date NOT NULL,
  "direction" text NOT NULL,
  "occurred_at" timestamp with time zone NOT NULL,
  "source" text DEFAULT 'web' NOT NULL,
  "location_status" text DEFAULT 'pending' NOT NULL,
  "location" jsonb,
  "explanation" text DEFAULT 'Attendance location requires approval.' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "requested_by" text NOT NULL,
  "decided_by" text,
  "decision_reason" text,
  "requested_at" timestamp with time zone DEFAULT now() NOT NULL,
  "decided_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "var_hr_attendance_punch_requests" ADD CONSTRAINT "var_hr_attendance_punch_requests_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "var_hr_attendance_punch_requests" ADD CONSTRAINT "var_hr_attendance_punch_requests_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "var_hr_attendance_punch_requests_company_status_idx" ON "var_hr_attendance_punch_requests" USING btree ("company_id","status","requested_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "var_hr_attendance_punch_requests_employee_date_idx" ON "var_hr_attendance_punch_requests" USING btree ("company_id","employee_id","attendance_date");