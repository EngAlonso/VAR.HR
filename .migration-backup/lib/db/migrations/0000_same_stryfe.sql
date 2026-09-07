CREATE TABLE "var_hr_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"gps_enabled" boolean DEFAULT false NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"radius_meters" numeric(8, 0),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"timezone" text DEFAULT 'Africa/Cairo' NOT NULL,
	"currency" text DEFAULT 'EGP' NOT NULL,
	"default_schedule_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "var_hr_companies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "var_hr_departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_ar" text DEFAULT '' NOT NULL,
	"description" text,
	"manager_id" uuid,
	"default_schedule_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"national_id" text,
	"biometric_code" text,
	"working_hours" numeric(4, 2) DEFAULT 8 NOT NULL,
	"department_id" uuid,
	"branch_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"role" text DEFAULT 'employee' NOT NULL,
	"automatic_overtime" text,
	"joined_on" date NOT NULL,
	"salary" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "var_hr_employees_employee_number_format_chk" CHECK ("var_hr_employees"."employee_number" ~ '^[1-9][0-9]*$' OR "var_hr_employees"."employee_number" ~ '^EMP-[0-9]+$')
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"attendance_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"attendance_date" date NOT NULL,
	"schedule_source" text NOT NULL,
	"raw_late_minutes" integer DEFAULT 0 NOT NULL,
	"late_grace_minutes" integer DEFAULT 0 NOT NULL,
	"effective_late_minutes" integer DEFAULT 0 NOT NULL,
	"raw_early_departure_minutes" integer DEFAULT 0 NOT NULL,
	"early_departure_grace_minutes" integer DEFAULT 0 NOT NULL,
	"effective_early_departure_minutes" integer DEFAULT 0 NOT NULL,
	"worked_minutes" integer DEFAULT 0 NOT NULL,
	"break_minutes" integer DEFAULT 0 NOT NULL,
	"paid_break" boolean DEFAULT true NOT NULL,
	"normal_worked_minutes" integer DEFAULT 0 NOT NULL,
	"overtime_minutes" integer DEFAULT 0 NOT NULL,
	"working_day" boolean DEFAULT false NOT NULL,
	"holiday" boolean DEFAULT false NOT NULL,
	"attendance_state" text DEFAULT 'present' NOT NULL,
	"approved_permission_minutes" integer DEFAULT 0 NOT NULL,
	"permission_covered_late_minutes" integer DEFAULT 0 NOT NULL,
	"permission_covered_early_minutes" integer DEFAULT 0 NOT NULL,
	"late_penalty_minutes" integer DEFAULT 0 NOT NULL,
	"early_departure_penalty_minutes" integer DEFAULT 0 NOT NULL,
	"absence_penalty_minutes" integer DEFAULT 0 NOT NULL,
	"total_penalty_minutes" integer DEFAULT 0 NOT NULL,
	"original_worked_minutes" integer DEFAULT 0 NOT NULL,
	"original_overtime_minutes" integer DEFAULT 0 NOT NULL,
	"manual_minutes" integer DEFAULT 0 NOT NULL,
	"manual_overtime_minutes" integer DEFAULT 0 NOT NULL,
	"manual_permission_minutes" integer DEFAULT 0 NOT NULL,
	"final_worked_minutes" integer DEFAULT 0 NOT NULL,
	"final_overtime_minutes" integer DEFAULT 0 NOT NULL,
	"final_penalty_minutes" integer DEFAULT 0 NOT NULL,
	"applied_overtime_multiplier" numeric(6, 3) DEFAULT 1 NOT NULL,
	"multiplier_source" text DEFAULT 'standard' NOT NULL,
	"time_multiplier_premium_minutes" numeric(10, 3) DEFAULT 0 NOT NULL,
	"explanation" jsonb NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance_rule_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"field_name" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb NOT NULL,
	"reason" text NOT NULL,
	"applies_from_month" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"work_start" text DEFAULT '09:00' NOT NULL,
	"work_end" text DEFAULT '17:00' NOT NULL,
	"schedule_name" text DEFAULT 'Standard schedule' NOT NULL,
	"required_hours" numeric(6, 2) DEFAULT 8 NOT NULL,
	"grace_minutes" integer DEFAULT 10 NOT NULL,
	"early_checkout_grace_minutes" integer DEFAULT 0 NOT NULL,
	"overtime_after_minutes" integer DEFAULT 30 NOT NULL,
	"overtime_eligible" boolean DEFAULT true NOT NULL,
	"overtime_method" text DEFAULT 'multiplier' NOT NULL,
	"overtime_multiplier" numeric(6, 3) DEFAULT 1.25 NOT NULL,
	"hourly_rate_divisor" integer DEFAULT 160 NOT NULL,
	"late_deduction_method" text DEFAULT 'hourly_rate' NOT NULL,
	"late_deduction_factor" numeric(6, 3) DEFAULT 0.5 NOT NULL,
	"early_checkout_deduction_factor" numeric(6, 3) DEFAULT 0.5 NOT NULL,
	"absence_deduction_method" text DEFAULT 'daily_rate' NOT NULL,
	"absence_deduction_factor" numeric(6, 3) DEFAULT 1 NOT NULL,
	"late_penalty_multiplier" integer DEFAULT 1 NOT NULL,
	"early_departure_penalty_multiplier" integer DEFAULT 1 NOT NULL,
	"absence_penalty_multiplier" integer DEFAULT 1 NOT NULL,
	"permission_covers_late" boolean DEFAULT true NOT NULL,
	"permission_covers_early" boolean DEFAULT true NOT NULL,
	"permission_covered_minutes_multiplier" integer DEFAULT 0 NOT NULL,
	"full_day_permission_multiplier" integer DEFAULT 0 NOT NULL,
	"holiday_dates" text[] DEFAULT '{}' NOT NULL,
	"holiday_periods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weekly_multipliers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"time_multipliers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"absence_deducts_annual_leave" boolean DEFAULT false NOT NULL,
	"absence_leave_deduction_trigger" text DEFAULT 'unexcused_absence' NOT NULL,
	"absence_leave_deduction_days" numeric(6, 2) DEFAULT 1 NOT NULL,
	"working_days" text[] DEFAULT '{"Mon","Tue","Wed","Thu","Sun"}' NOT NULL,
	"gps_policy" text DEFAULT 'optional' NOT NULL,
	"location_radius_meters" integer DEFAULT 150 NOT NULL,
	"annual_leave_entitlement" numeric(8, 2) DEFAULT 21 NOT NULL,
	"annual_leave_period_start_month" integer DEFAULT 1 NOT NULL,
	"annual_leave_allowed_months" integer[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12}' NOT NULL,
	"annual_leave_monthly_deduction_limit" numeric(8, 2) DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" text DEFAULT 'present' NOT NULL,
	"scheduled_start" text DEFAULT '09:00' NOT NULL,
	"scheduled_end" text DEFAULT '17:00' NOT NULL,
	"required_hours" numeric(6, 2) DEFAULT 8 NOT NULL,
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"worked_hours" numeric(6, 2) DEFAULT 0 NOT NULL,
	"overtime_hours" numeric(6, 2) DEFAULT 0 NOT NULL,
	"late_minutes" integer DEFAULT 0 NOT NULL,
	"early_checkout_minutes" integer DEFAULT 0 NOT NULL,
	"missing_minutes" integer DEFAULT 0 NOT NULL,
	"location_status" text DEFAULT 'not_required' NOT NULL,
	"source" text DEFAULT 'web' NOT NULL,
	"location" jsonb,
	"explanation" text DEFAULT 'Attendance event recorded.' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance_time_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"attendance_id" uuid NOT NULL,
	"adjustment_date" date NOT NULL,
	"minutes" integer NOT NULL,
	"adjustment_type" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" text NOT NULL,
	"approved_by" text,
	"rejected_by" text,
	"reversed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"reversed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "var_hr_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"actor_type" text DEFAULT 'system' NOT NULL,
	"actor_id" text DEFAULT 'system' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_leave_balance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type" text NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"transaction_type" text NOT NULL,
	"before_balance" numeric(8, 2) NOT NULL,
	"after_balance" numeric(8, 2) NOT NULL,
	"source_request_id" uuid,
	"actor_id" text NOT NULL,
	"reason" text NOT NULL,
	"event_date" date,
	"transaction_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"allocated" numeric(6, 2) DEFAULT 0 NOT NULL,
	"used" numeric(6, 2) DEFAULT 0 NOT NULL,
	"pending" numeric(6, 2) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_leave_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"leave_type" text NOT NULL,
	"annual_entitlement" numeric(8, 2) DEFAULT 0 NOT NULL,
	"accrual_frequency" text DEFAULT 'annual' NOT NULL,
	"deduction_mode" text DEFAULT 'automatic' NOT NULL,
	"carry_forward_allowed" boolean DEFAULT false NOT NULL,
	"carry_forward_days" numeric(8, 2) DEFAULT 0 NOT NULL,
	"carry_forward_expiry_months" integer,
	"allow_negative" boolean DEFAULT false NOT NULL,
	"period_start_month" integer DEFAULT 1 NOT NULL,
	"allowed_balance_months" integer[] DEFAULT '{1,2,3,4,5,6,7,8,9,10,11,12}' NOT NULL,
	"monthly_deduction_limit" numeric(8, 2) DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"from" date NOT NULL,
	"to" date NOT NULL,
	"days" numeric(6, 2) NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_by" text,
	"decision_reason" text,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "var_hr_permission_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decision_reason" text,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "var_hr_employee_payroll_cycle_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"cycle_id" uuid NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_payroll_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text DEFAULT 'variable' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"reason" text NOT NULL,
	"created_by" text DEFAULT 'system' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_payroll_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"period_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"basic_salary" numeric(14, 2) DEFAULT 0 NOT NULL,
	"additions" numeric(14, 2) DEFAULT 0 NOT NULL,
	"overtime" numeric(14, 2) DEFAULT 0 NOT NULL,
	"time_multiplier_premium" numeric(14, 2) DEFAULT 0 NOT NULL,
	"attendance_deductions" numeric(14, 2) DEFAULT 0 NOT NULL,
	"other_deductions" numeric(14, 2) DEFAULT 0 NOT NULL,
	"net_salary" numeric(14, 2) DEFAULT 0 NOT NULL,
	"regular_hours" numeric(8, 2) DEFAULT 0 NOT NULL,
	"overtime_hours" numeric(8, 2) DEFAULT 0 NOT NULL,
	"late_minutes" integer DEFAULT 0 NOT NULL,
	"early_checkout_minutes" integer DEFAULT 0 NOT NULL,
	"missing_hours" numeric(8, 2) DEFAULT 0 NOT NULL,
	"absent_days" numeric(8, 2) DEFAULT 0 NOT NULL,
	"line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inputs_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"calculation_version" integer DEFAULT 1 NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_payroll_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_day" integer NOT NULL,
	"pay_day" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_payroll_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"cycle_id" uuid,
	"label" text NOT NULL,
	"from" date NOT NULL,
	"to" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"employee_count" integer DEFAULT 0 NOT NULL,
	"total_net" numeric(14, 2) DEFAULT 0 NOT NULL,
	"calculated_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"finalized_by" text
);
--> statement-breakpoint
CREATE TABLE "var_hr_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"employee_limit" integer NOT NULL,
	"manager_limit" integer DEFAULT 0 NOT NULL,
	"branch_limit" integer DEFAULT 0 NOT NULL,
	"device_limit" integer DEFAULT 0 NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" text DEFAULT 'trial' NOT NULL,
	"employee_limit" integer,
	"monthly_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"annual_price" numeric(14, 2) DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_attendance_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"radius_meters" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_biometric_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"device_employee_id" text NOT NULL,
	"employee_id" uuid,
	"occurred_at" timestamp with time zone NOT NULL,
	"event_type" text NOT NULL,
	"direction" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"raw_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"processing_status" text DEFAULT 'received' NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_biometric_sync_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"provider_key" text DEFAULT 'generic' NOT NULL,
	"operation" text DEFAULT 'attendance_sync' NOT NULL,
	"status" text NOT NULL,
	"message" text NOT NULL,
	"events_received" integer DEFAULT 0 NOT NULL,
	"events_processed" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "var_hr_device_employee_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"device_employee_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"manufacturer" text NOT NULL,
	"model" text NOT NULL,
	"branch_id" uuid NOT NULL,
	"adapter_key" text DEFAULT 'generic' NOT NULL,
	"connection_type" text DEFAULT 'unknown' NOT NULL,
	"host" text,
	"port" integer,
	"device_identifier" text,
	"biometric_code" text,
	"registration_key_hash" text,
	"registration_key_last4" text,
	"status" text DEFAULT 'not_configured' NOT NULL,
	"integration_state" text DEFAULT 'adapter_pending' NOT NULL,
	"connection_state" text DEFAULT 'unknown' NOT NULL,
	"last_sync" timestamp with time zone,
	"last_health_check" timestamp with time zone,
	"note" text DEFAULT 'Connector adapter not configured yet.' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_employee_schedule_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"schedule_id" uuid NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"end_date" date,
	"recurring" boolean DEFAULT false NOT NULL,
	"multiplier" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_work_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_ar" text DEFAULT '' NOT NULL,
	"working_days" text[] DEFAULT '{"Sun","Mon","Tue","Wed","Thu"}' NOT NULL,
	"start_time" text DEFAULT '09:00' NOT NULL,
	"end_time" text DEFAULT '17:00' NOT NULL,
	"overnight" boolean DEFAULT false NOT NULL,
	"required_hours" integer DEFAULT 8 NOT NULL,
	"break_duration_minutes" integer DEFAULT 0 NOT NULL,
	"break_paid" boolean DEFAULT true NOT NULL,
	"grace_minutes" integer DEFAULT 10 NOT NULL,
	"early_checkout_grace_minutes" integer DEFAULT 0 NOT NULL,
	"overtime_after_minutes" integer DEFAULT 30 NOT NULL,
	"overtime_eligible" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_employee_hr_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"job_title" text,
	"employment_type" text,
	"manager_id" uuid,
	"address" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_account_permissions" (
	"account_id" uuid NOT NULL,
	"permission_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_auth_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid,
	"company_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"account_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "var_hr_auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "var_hr_employee_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"biometric_employee_number" text NOT NULL,
	"username" text NOT NULL,
	"account_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "var_hr_employee_identities_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "var_hr_permissions" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"primary_phone" text DEFAULT '' NOT NULL,
	"backup_phones" text[] DEFAULT '{}' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"backup_emails" text[] DEFAULT '{}' NOT NULL,
	"password_hash" text NOT NULL,
	"account_type" text NOT NULL,
	"display_role" text DEFAULT 'Staff' NOT NULL,
	"company_id" uuid,
	"employee_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "var_hr_user_accounts_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "var_hr_backup_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"company_id" uuid,
	"created_by" uuid NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"size_bytes" integer NOT NULL,
	"checksum" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_notification_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"auth" text NOT NULL,
	"p256dh" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "var_hr_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "var_hr_branches" ADD CONSTRAINT "var_hr_branches_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_departments" ADD CONSTRAINT "var_hr_departments_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD CONSTRAINT "var_hr_employees_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD CONSTRAINT "var_hr_employees_department_id_var_hr_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."var_hr_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employees" ADD CONSTRAINT "var_hr_employees_branch_id_var_hr_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."var_hr_branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_calculations" ADD CONSTRAINT "var_hr_attendance_calculations_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_calculations" ADD CONSTRAINT "var_hr_attendance_calculations_attendance_id_var_hr_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."var_hr_attendance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_calculations" ADD CONSTRAINT "var_hr_attendance_calculations_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_rule_changes" ADD CONSTRAINT "var_hr_attendance_rule_changes_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_rule_changes" ADD CONSTRAINT "var_hr_attendance_rule_changes_actor_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_rules" ADD CONSTRAINT "var_hr_attendance_rules_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance" ADD CONSTRAINT "var_hr_attendance_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance" ADD CONSTRAINT "var_hr_attendance_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_time_adjustments" ADD CONSTRAINT "var_hr_attendance_time_adjustments_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_time_adjustments" ADD CONSTRAINT "var_hr_attendance_time_adjustments_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_time_adjustments" ADD CONSTRAINT "var_hr_attendance_time_adjustments_attendance_id_var_hr_attendance_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."var_hr_attendance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_audit_logs" ADD CONSTRAINT "var_hr_audit_logs_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_balance_transactions" ADD CONSTRAINT "var_hr_leave_balance_transactions_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_balance_transactions" ADD CONSTRAINT "var_hr_leave_balance_transactions_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_balance_transactions" ADD CONSTRAINT "var_hr_leave_balance_transactions_source_request_id_var_hr_leave_requests_id_fk" FOREIGN KEY ("source_request_id") REFERENCES "public"."var_hr_leave_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_balances" ADD CONSTRAINT "var_hr_leave_balances_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_balances" ADD CONSTRAINT "var_hr_leave_balances_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_policies" ADD CONSTRAINT "var_hr_leave_policies_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_policies" ADD CONSTRAINT "var_hr_leave_policies_created_by_var_hr_user_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_requests" ADD CONSTRAINT "var_hr_leave_requests_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_leave_requests" ADD CONSTRAINT "var_hr_leave_requests_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_permission_requests" ADD CONSTRAINT "var_hr_permission_requests_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_permission_requests" ADD CONSTRAINT "var_hr_permission_requests_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_payroll_cycle_assignments" ADD CONSTRAINT "var_hr_employee_payroll_cycle_assignments_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_payroll_cycle_assignments" ADD CONSTRAINT "var_hr_employee_payroll_cycle_assignments_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_payroll_cycle_assignments" ADD CONSTRAINT "var_hr_employee_payroll_cycle_assignments_cycle_id_var_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."var_hr_payroll_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_adjustments" ADD CONSTRAINT "var_hr_payroll_adjustments_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_adjustments" ADD CONSTRAINT "var_hr_payroll_adjustments_period_id_var_hr_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."var_hr_payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_adjustments" ADD CONSTRAINT "var_hr_payroll_adjustments_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_calculations" ADD CONSTRAINT "var_hr_payroll_calculations_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_calculations" ADD CONSTRAINT "var_hr_payroll_calculations_period_id_var_hr_payroll_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."var_hr_payroll_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_calculations" ADD CONSTRAINT "var_hr_payroll_calculations_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_cycles" ADD CONSTRAINT "var_hr_payroll_cycles_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_periods" ADD CONSTRAINT "var_hr_payroll_periods_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_payroll_periods" ADD CONSTRAINT "var_hr_payroll_periods_cycle_id_var_hr_payroll_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."var_hr_payroll_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_subscriptions" ADD CONSTRAINT "var_hr_subscriptions_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_subscriptions" ADD CONSTRAINT "var_hr_subscriptions_plan_id_var_hr_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."var_hr_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_attendance_locations" ADD CONSTRAINT "var_hr_attendance_locations_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_biometric_events" ADD CONSTRAINT "var_hr_biometric_events_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_biometric_events" ADD CONSTRAINT "var_hr_biometric_events_device_id_var_hr_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."var_hr_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_biometric_events" ADD CONSTRAINT "var_hr_biometric_events_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_biometric_sync_history" ADD CONSTRAINT "var_hr_biometric_sync_history_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_biometric_sync_history" ADD CONSTRAINT "var_hr_biometric_sync_history_device_id_var_hr_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."var_hr_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_device_employee_mappings" ADD CONSTRAINT "var_hr_device_employee_mappings_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_device_employee_mappings" ADD CONSTRAINT "var_hr_device_employee_mappings_device_id_var_hr_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."var_hr_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_device_employee_mappings" ADD CONSTRAINT "var_hr_device_employee_mappings_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_devices" ADD CONSTRAINT "var_hr_devices_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_devices" ADD CONSTRAINT "var_hr_devices_branch_id_var_hr_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."var_hr_branches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_schedule_assignments" ADD CONSTRAINT "var_hr_employee_schedule_assignments_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_schedule_assignments" ADD CONSTRAINT "var_hr_employee_schedule_assignments_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_schedule_assignments" ADD CONSTRAINT "var_hr_employee_schedule_assignments_schedule_id_var_hr_work_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "public"."var_hr_work_schedules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_holidays" ADD CONSTRAINT "var_hr_holidays_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_work_schedules" ADD CONSTRAINT "var_hr_work_schedules_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_hr_records" ADD CONSTRAINT "var_hr_employee_hr_records_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_hr_records" ADD CONSTRAINT "var_hr_employee_hr_records_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_hr_records" ADD CONSTRAINT "var_hr_employee_hr_records_manager_id_var_hr_employees_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_account_permissions" ADD CONSTRAINT "var_hr_account_permissions_account_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_account_permissions" ADD CONSTRAINT "var_hr_account_permissions_permission_key_var_hr_permissions_key_fk" FOREIGN KEY ("permission_key") REFERENCES "public"."var_hr_permissions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_auth_audit_events" ADD CONSTRAINT "var_hr_auth_audit_events_account_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_auth_audit_events" ADD CONSTRAINT "var_hr_auth_audit_events_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_auth_sessions" ADD CONSTRAINT "var_hr_auth_sessions_account_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_identities" ADD CONSTRAINT "var_hr_employee_identities_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_identities" ADD CONSTRAINT "var_hr_employee_identities_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_identities" ADD CONSTRAINT "var_hr_employee_identities_device_id_var_hr_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."var_hr_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_employee_identities" ADD CONSTRAINT "var_hr_employee_identities_account_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_user_accounts" ADD CONSTRAINT "var_hr_user_accounts_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_user_accounts" ADD CONSTRAINT "var_hr_user_accounts_employee_id_var_hr_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."var_hr_employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_backup_records" ADD CONSTRAINT "var_hr_backup_records_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_backup_records" ADD CONSTRAINT "var_hr_backup_records_created_by_var_hr_user_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_notification_subscriptions" ADD CONSTRAINT "var_hr_notification_subscriptions_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_notification_subscriptions" ADD CONSTRAINT "var_hr_notification_subscriptions_user_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_notifications" ADD CONSTRAINT "var_hr_notifications_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "var_hr_notifications" ADD CONSTRAINT "var_hr_notifications_user_id_var_hr_user_accounts_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."var_hr_user_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employees_company_employee_number_uidx" ON "var_hr_employees" USING btree ("company_id","employee_number");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employees_company_national_id_uidx" ON "var_hr_employees" USING btree ("company_id","national_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employees_company_phone_uidx" ON "var_hr_employees" USING btree ("company_id","phone");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_attendance_calculations_attendance_uidx" ON "var_hr_attendance_calculations" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "var_hr_attendance_calculations_company_date_idx" ON "var_hr_attendance_calculations" USING btree ("company_id","attendance_date");--> statement-breakpoint
CREATE INDEX "var_hr_attendance_rule_changes_company_created_idx" ON "var_hr_attendance_rule_changes" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_attendance_rules_company_uidx" ON "var_hr_attendance_rules" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_attendance_time_adjustments_duplicate_uidx" ON "var_hr_attendance_time_adjustments" USING btree ("company_id","employee_id","adjustment_date","minutes","adjustment_type","reason","status");--> statement-breakpoint
CREATE INDEX "var_hr_attendance_time_adjustments_company_date_idx" ON "var_hr_attendance_time_adjustments" USING btree ("company_id","adjustment_date","employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_leave_balance_transactions_source_type_uidx" ON "var_hr_leave_balance_transactions" USING btree ("source_request_id","transaction_type");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_leave_balance_transactions_key_uidx" ON "var_hr_leave_balance_transactions" USING btree ("transaction_key");--> statement-breakpoint
CREATE INDEX "var_hr_leave_balance_transactions_employee_type_idx" ON "var_hr_leave_balance_transactions" USING btree ("company_id","employee_id","leave_type","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_leave_balances_employee_type_uidx" ON "var_hr_leave_balances" USING btree ("company_id","employee_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_leave_policies_company_type_uidx" ON "var_hr_leave_policies" USING btree ("company_id","leave_type");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_payroll_cycles_employee_effective_uidx" ON "var_hr_employee_payroll_cycle_assignments" USING btree ("company_id","employee_id","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_payroll_cycles_company_name_uidx" ON "var_hr_payroll_cycles" USING btree ("company_id","name");--> statement-breakpoint
CREATE INDEX "var_hr_attendance_locations_company_idx" ON "var_hr_attendance_locations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_biometric_events_company_idx" ON "var_hr_biometric_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_biometric_events_device_idx" ON "var_hr_biometric_events" USING btree ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_biometric_events_idempotency_uidx" ON "var_hr_biometric_events" USING btree ("company_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "var_hr_biometric_sync_history_company_idx" ON "var_hr_biometric_sync_history" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_biometric_sync_history_device_idx" ON "var_hr_biometric_sync_history" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "var_hr_device_mappings_company_idx" ON "var_hr_device_employee_mappings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_device_mappings_device_idx" ON "var_hr_device_employee_mappings" USING btree ("device_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_device_mappings_device_identity_uidx" ON "var_hr_device_employee_mappings" USING btree ("device_id","device_employee_id");--> statement-breakpoint
CREATE INDEX "var_hr_devices_company_idx" ON "var_hr_devices" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_devices_biometric_code_uidx" ON "var_hr_devices" USING btree ("company_id","biometric_code");--> statement-breakpoint
CREATE INDEX "var_hr_employee_schedule_assignments_company_idx" ON "var_hr_employee_schedule_assignments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_employee_schedule_assignments_employee_idx" ON "var_hr_employee_schedule_assignments" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_schedule_assignments_active_uidx" ON "var_hr_employee_schedule_assignments" USING btree ("company_id","employee_id","effective_from");--> statement-breakpoint
CREATE INDEX "var_hr_holidays_company_idx" ON "var_hr_holidays" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_holidays_company_date_uidx" ON "var_hr_holidays" USING btree ("company_id","date");--> statement-breakpoint
CREATE INDEX "var_hr_work_schedules_company_idx" ON "var_hr_work_schedules" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_employee_hr_records_company_idx" ON "var_hr_employee_hr_records" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_hr_records_employee_uidx" ON "var_hr_employee_hr_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "var_hr_account_permissions_account_idx" ON "var_hr_account_permissions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_account_permissions_uidx" ON "var_hr_account_permissions" USING btree ("account_id","permission_key");--> statement-breakpoint
CREATE INDEX "var_hr_auth_audit_account_idx" ON "var_hr_auth_audit_events" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "var_hr_auth_audit_company_idx" ON "var_hr_auth_audit_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_employee_identities_company_idx" ON "var_hr_employee_identities" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_identities_device_uidx" ON "var_hr_employee_identities" USING btree ("device_id","biometric_employee_number");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_employee_identities_employee_uidx" ON "var_hr_employee_identities" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "var_hr_user_accounts_company_idx" ON "var_hr_user_accounts" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_user_accounts_employee_uidx" ON "var_hr_user_accounts" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "var_hr_backup_records_scope_idx" ON "var_hr_backup_records" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "var_hr_backup_records_company_idx" ON "var_hr_backup_records" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_backup_records_created_at_idx" ON "var_hr_backup_records" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "var_hr_notification_subscriptions_endpoint_uidx" ON "var_hr_notification_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "var_hr_notification_subscriptions_user_idx" ON "var_hr_notification_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "var_hr_notification_subscriptions_company_idx" ON "var_hr_notification_subscriptions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "var_hr_notifications_user_created_at_idx" ON "var_hr_notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "var_hr_notifications_user_read_idx" ON "var_hr_notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "var_hr_notifications_company_created_at_idx" ON "var_hr_notifications" USING btree ("company_id","created_at");