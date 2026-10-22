import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type PlatformSocialLinks = {
  facebook: string;
  instagram: string;
  linkedin: string;
  x: string;
  youtube: string;
  tiktok: string;
  whatsapp: string;
};

export const emptyPlatformSocialLinks: PlatformSocialLinks = {
  facebook: "",
  instagram: "",
  linkedin: "",
  x: "",
  youtube: "",
  tiktok: "",
  whatsapp: "",
};

export const platformSettingsTable = pgTable("var_hr_platform_settings", {
  id: text("id").primaryKey().default("default"),
  siteName: text("site_name").notNull().default("VAR HR"),
  logoVariant: text("logo_variant").notNull().default("horizontal"),
  pwaIcon180Path: text("pwa_icon_180_path"),
  pwaIcon192Path: text("pwa_icon_192_path"),
  pwaIcon512Path: text("pwa_icon_512_path"),
  socialLinks: jsonb("social_links")
    .$type<PlatformSocialLinks>()
    .notNull()
    .default(emptyPlatformSocialLinks),
  platformBackupRunsPerDay: integer("platform_backup_interval_minutes")
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