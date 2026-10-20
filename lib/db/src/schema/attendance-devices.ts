import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companiesTable, employeesTable } from "./organization";
import { userAccountsTable } from "./auth";

export const employeeAttendanceDevicesTable = pgTable(
  "var_hr_employee_attendance_devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employeesTable.id),
    tokenHash: text("token_hash").notNull(),
    deviceLabel: text("device_label").notNull().default("Browser device"),
    status: text("status").notNull().default("pending"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => userAccountsTable.id, {
      onDelete: "set null",
    }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    employeeIndex: index("var_hr_employee_attendance_devices_employee_idx").on(
      table.companyId,
      table.employeeId,
      table.status,
    ),
    employeeTokenUnique: uniqueIndex(
      "var_hr_employee_attendance_devices_employee_token_uidx",
    ).on(table.companyId, table.employeeId, table.tokenHash),
    oneActiveDevicePerEmployee: uniqueIndex(
      "var_hr_employee_attendance_devices_one_active_uidx",
    )
      .on(table.companyId, table.employeeId)
      .where(sql`${table.status} = 'active'`),
  }),
);

export type EmployeeAttendanceDevice =
  typeof employeeAttendanceDevicesTable.$inferSelect;
