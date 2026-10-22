CREATE TABLE "var_hr_employee_attendance_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"device_label" text DEFAULT 'Browser device' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" uuid,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "var_hr_platform_settings" ADD COLUMN "social_links" jsonb DEFAULT '{"facebook":"","instagram":"","linkedin":"","x":"","youtube":"","tiktok":"","whatsapp":""}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "var_hr_employee_attendance_devices" ADD CONSTRAINT "var_hr_employee_attendance_devices_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_attendance_devices" ADD CONSTRAINT "var_hr_employee_attendance_devices_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_attendance_devices" ADD CONSTRAINT "var_hr_employee_attendance_devices_approved_by_var_hr_user_accounts_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "var_hr_employee_attendance_devices_employee_idx" ON "var_hr_employee_attendance_devices" USING btree ("company_id","employee_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_attendance_devices_employee_token_uidx" ON "var_hr_employee_attendance_devices" USING btree ("company_id","employee_id","token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_attendance_devices_one_active_uidx" ON "var_hr_employee_attendance_devices" USING btree ("company_id","employee_id") WHERE "var_hr_employee_attendance_devices"."status" = 'active';