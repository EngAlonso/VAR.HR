ALTER TABLE "var_hr_attendance_punch_requests" ADD COLUMN IF NOT EXISTS "device_type" text;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_rules" ADD COLUMN IF NOT EXISTS "attendance_device_approval_required" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "var_hr_attendance" ADD COLUMN IF NOT EXISTS "check_in_device_type" text;--> statement-breakpoint
ALTER TABLE "var_hr_attendance" ADD COLUMN IF NOT EXISTS "check_out_device_type" text;