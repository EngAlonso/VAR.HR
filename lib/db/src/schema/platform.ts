import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformSettingsTable = pgTable("var_hr_platform_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("VAR HR"),
  logoVariant: text("logo_variant").notNull().default("horizontal"),
  platformBackupIntervalMinutes: integer("platform_backup_interval_minutes")
    .notNull()
    .default(0),
  companyBackupIntervalMinutes: integer("company_backup_interval_minutes")
    .notNull()
    .default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PlatformSettings = typeof platformSettingsTable.$inferSelect;