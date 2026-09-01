import { createInsertSchema } from "drizzle-zod";
import {
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { companiesTable, employeesTable } from "./organization";

export const payrollPeriodsTable = pgTable("var_hr_payroll_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  label: text("label").notNull(),
  from: date("from", { mode: "string" }).notNull(),
  to: date("to", { mode: "string" }).notNull(),
  status: text("status").notNull().default("draft"),
  employeeCount: integer("employee_count").notNull().default(0),
  totalNet: numeric("total_net", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }),
  finalizedAt: timestamp("finalized_at", { withTimezone: true }),
  finalizedBy: text("finalized_by"),
});

export const payrollCalculationsTable = pgTable("var_hr_payroll_calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  periodId: uuid("period_id").notNull().references(() => payrollPeriodsTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  basicSalary: numeric("basic_salary", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  additions: numeric("additions", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  overtime: numeric("overtime", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  timeMultiplierPremium: numeric("time_multiplier_premium", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  attendanceDeductions: numeric("attendance_deductions", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  otherDeductions: numeric("other_deductions", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  netSalary: numeric("net_salary", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  regularHours: numeric("regular_hours", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  overtimeHours: numeric("overtime_hours", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  lateMinutes: integer("late_minutes").notNull().default(0),
  earlyCheckoutMinutes: integer("early_checkout_minutes").notNull().default(0),
  missingHours: numeric("missing_hours", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  absentDays: numeric("absent_days", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  lineItems: jsonb("line_items").notNull().default([]),
  inputsSnapshot: jsonb("inputs_snapshot").notNull().default({}),
  calculationVersion: integer("calculation_version").notNull().default(1),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payrollAdjustmentsTable = pgTable("var_hr_payroll_adjustments", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  periodId: uuid("period_id").notNull().references(() => payrollPeriodsTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  type: text("type").notNull(),
  category: text("category").notNull().default("variable"),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  reason: text("reason").notNull(),
  createdBy: text("created_by").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const plansTable = pgTable("var_hr_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  employeeLimit: integer("employee_limit").notNull(),
  managerLimit: integer("manager_limit").notNull().default(0),
  branchLimit: integer("branch_limit").notNull().default(0),
  deviceLimit: integer("device_limit").notNull().default(0),
  features: text("features").array().notNull().default([]),
});

export const subscriptionsTable = pgTable("var_hr_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  planId: uuid("plan_id").notNull().references(() => plansTable.id),
  status: text("status").notNull().default("trial"),
  employeeLimit: integer("employee_limit"),
  monthlyPrice: numeric("monthly_price", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  annualPrice: numeric("annual_price", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPayrollPeriodSchema = createInsertSchema(payrollPeriodsTable).omit({
  id: true,
  calculatedAt: true,
});
export type PayrollPeriod = typeof payrollPeriodsTable.$inferSelect;
export type PayrollCalculation = typeof payrollCalculationsTable.$inferSelect;
export type PayrollAdjustment = typeof payrollAdjustmentsTable.$inferSelect;
export type Plan = typeof plansTable.$inferSelect;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertPayrollPeriod = z.infer<typeof insertPayrollPeriodSchema>;