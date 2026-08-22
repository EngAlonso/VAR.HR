import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { companiesTable } from "./organization";
import { userAccountsTable } from "./auth";

export const backupRecordsTable = pgTable(
  "var_hr_backup_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope: text("scope").notNull(),
    companyId: uuid("company_id").references(() => companiesTable.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => userAccountsTable.id),
    status: text("status").notNull().default("ready"),
    sizeBytes: integer("size_bytes").notNull(),
    checksum: text("checksum").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    scopeIndex: index("var_hr_backup_records_scope_idx").on(table.scope),
    companyIndex: index("var_hr_backup_records_company_idx").on(
      table.companyId,
    ),
    createdAtIndex: index("var_hr_backup_records_created_at_idx").on(
      table.createdAt,
    ),
  }),
);

export type BackupRecord = typeof backupRecordsTable.$inferSelect;