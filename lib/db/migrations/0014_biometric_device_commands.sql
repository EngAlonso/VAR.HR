CREATE TABLE IF NOT EXISTS "var_hr_biometric_device_commands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"command_number" serial NOT NULL,
	"company_id" uuid NOT NULL,
	"device_id" uuid NOT NULL,
	"sync_history_id" uuid,
	"command" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"result" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "var_hr_biometric_device_commands_command_number_unique" UNIQUE("command_number"),
	CONSTRAINT "var_hr_biometric_device_commands_company_id_var_hr_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."var_hr_companies"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "var_hr_biometric_device_commands_device_id_var_hr_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."var_hr_devices"("id") ON DELETE no action ON UPDATE no action,
	CONSTRAINT "var_hr_biometric_device_commands_sync_history_id_var_hr_biometric_sync_history_id_fk" FOREIGN KEY ("sync_history_id") REFERENCES "public"."var_hr_biometric_sync_history"("id") ON DELETE no action ON UPDATE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "var_hr_biometric_device_commands_company_idx" ON "var_hr_biometric_device_commands" USING btree ("company_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "var_hr_biometric_device_commands_device_idx" ON "var_hr_biometric_device_commands" USING btree ("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "var_hr_biometric_device_commands_status_idx" ON "var_hr_biometric_device_commands" USING btree ("device_id","status");
