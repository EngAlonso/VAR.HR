import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { companiesTable, employeesTable } from "./organization";

export const workSchedulesTable = pgTable("var_hr_work_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull().default(""),
  workingDays: text("working_days").array().notNull().default(["Sun", "Mon", "Tue", "Wed", "Thu"]),
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("17:00"),
  overnight: boolean("overnight").notNull().default(false),
  requiredHours: integer("required_hours").notNull().default(8),
  breakDurationMinutes: integer("break_duration_minutes").notNull().default(0),
  breakPaid: boolean("break_paid").notNull().default(true),
  graceMinutes: integer("grace_minutes").notNull().default(10),
  earlyCheckoutGraceMinutes: integer("early_checkout_grace_minutes").notNull().default(0),
  overtimeAfterMinutes: integer("overtime_after_minutes").notNull().default(30),
  overtimeEligible: boolean("overtime_eligible").notNull().default(true),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_work_schedules_company_idx").on(table.companyId),
}));

export const employeeScheduleAssignmentsTable = pgTable("var_hr_employee_schedule_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  scheduleId: uuid("schedule_id").notNull().references(() => workSchedulesTable.id),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  effectiveTo: date("effective_to", { mode: "string" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_employee_schedule_assignments_company_idx").on(table.companyId),
  employeeIndex: index("var_hr_employee_schedule_assignments_employee_idx").on(table.employeeId),
  activeAssignmentUnique: uniqueIndex("var_hr_employee_schedule_assignments_active_uidx")
    .on(table.companyId, table.employeeId, table.effectiveFrom),
}));

export const holidaysTable = pgTable("var_hr_holidays", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  name: text("name").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  recurring: boolean("recurring").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_holidays_company_idx").on(table.companyId),
  companyDateUnique: uniqueIndex("var_hr_holidays_company_date_uidx").on(table.companyId, table.date),
}));

export type WorkSchedule = typeof workSchedulesTable.$inferSelect;
export type EmployeeScheduleAssignment = typeof employeeScheduleAssignmentsTable.$inferSelect;
export type Holiday = typeof holidaysTable.$inferSelect;