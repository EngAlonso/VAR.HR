import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { companiesTable, employeesTable } from "./organization";

export const employeeHrRecordsTable = pgTable("var_hr_employee_hr_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  jobTitle: text("job_title"),
  employmentType: text("employment_type"),
  managerId: uuid("manager_id").references(() => employeesTable.id),
  address: text("address"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_employee_hr_records_company_idx").on(table.companyId),
  employeeUnique: uniqueIndex("var_hr_employee_hr_records_employee_uidx").on(table.employeeId),
}));

export type EmployeeHrRecord = typeof employeeHrRecordsTable.$inferSelect;