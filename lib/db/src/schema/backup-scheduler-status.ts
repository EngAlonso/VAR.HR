import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { companiesTable } from "./organization";

export const backupSchedulerStatusTable = pgTable(
  "var_hr_backup_scheduler_status",
  {
    targetKey: text("target_key").primaryKey(),
    runId: uuid("run_id").notNull(),
    targetType: text("target_type").notNull(),
    companyId: uuid("company_id").references(() => companiesTable.id, {
      onDelete: "set null",
    }),
    companyName: text("company_name"),
    companyNameEn: text("company_name_en"),
    source: text("source").notNull(),
    status: text("status").notNull(),
    reason: text("reason"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    backupsCreated: integer("backups_created").notNull().default(0),
    platformCreated: integer("platform_created").notNull().default(0),
    companyCreated: integer("company_created").notNull().default(0),
    failureCount: integer("failure_count").notNull().default(0),
    driveUploaded: integer("drive_uploaded").notNull().default(0),
    driveFailed: integer("drive_failed").notNull().default(0),
    drivePending: integer("drive_pending").notNull().default(0),
    errorMessage: text("error_message"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("var_hr_backup_scheduler_status_type_idx").on(table.targetType),
    index("var_hr_backup_scheduler_status_company_idx").on(table.companyId),
  ],
);

export type BackupSchedulerStatus =
  typeof backupSchedulerStatusTable.$inferSelect;
