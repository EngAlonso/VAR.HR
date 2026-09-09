import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const platformSettingsTable = pgTable("var_hr_platform_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("VAR HR"),
  logoVariant: text("logo_variant").notNull().default("horizontal"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PlatformSettings = typeof platformSettingsTable.$inferSelect;