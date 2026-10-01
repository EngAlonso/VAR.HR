CREATE TABLE "var_hr_google_drive_connection" (
  "id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
  "refresh_token_ciphertext" text,
  "connected_email" text,
  "connected_by" uuid,
  "connected_at" timestamp with time zone,
  "drive_folder_id" text,
  "drive_folder_web_view_link" text,
  "oauth_state_hash" text,
  "oauth_state_account_id" uuid,
  "oauth_state_expires_at" timestamp with time zone,
  "oauth_return_to" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "var_hr_google_drive_connection"
  ADD CONSTRAINT "var_hr_google_drive_connection_connected_by_var_hr_user_accounts_id_fk"
  FOREIGN KEY ("connected_by") REFERENCES "public"."var_hr_user_accounts"("id")
  ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "var_hr_google_drive_connection"
  ADD CONSTRAINT "var_hr_google_drive_connection_oauth_state_account_id_var_hr_user_accounts_id_fk"
  FOREIGN KEY ("oauth_state_account_id") REFERENCES "public"."var_hr_user_accounts"("id")
  ON DELETE set null ON UPDATE no action;