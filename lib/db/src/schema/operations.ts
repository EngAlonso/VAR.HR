import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { branchesTable, companiesTable, departmentsTable, employeesTable } from "./organization";

export const attendanceTable = pgTable("var_hr_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  date: date("date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("present"),
  scheduledStart: text("scheduled_start").notNull().default("09:00"),
  scheduledEnd: text("scheduled_end").notNull().default("17:00"),
  requiredHours: numeric("required_hours", { precision: 6, scale: 2, mode: "number" }).notNull().default(8),
  checkIn: timestamp("check_in", { withTimezone: true }),
  checkOut: timestamp("check_out", { withTimezone: true }),
  workedHours: numeric("worked_hours", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
  overtimeHours: numeric("overtime_hours", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
  lateMinutes: integer("late_minutes").notNull().default(0),
  earlyCheckoutMinutes: integer("early_checkout_minutes").notNull().default(0),
  missingMinutes: integer("missing_minutes").notNull().default(0),
  locationStatus: text("location_status").notNull().default("not_required"),
  source: text("source").notNull().default("web"),
  location: jsonb("location"),
  explanation: text("explanation").notNull().default("Attendance event recorded."),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attendanceCalculationsTable = pgTable("var_hr_attendance_calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  attendanceId: uuid("attendance_id").notNull().references(() => attendanceTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  attendanceDate: date("attendance_date", { mode: "string" }).notNull(),
  ruleVersion: integer("rule_version").notNull(),
  ruleEffectiveFrom: date("rule_effective_from", { mode: "string" }).notNull(),
  scheduleSource: text("schedule_source").notNull(),
  rawLateMinutes: integer("raw_late_minutes").notNull().default(0),
  lateGraceMinutes: integer("late_grace_minutes").notNull().default(0),
  effectiveLateMinutes: integer("effective_late_minutes").notNull().default(0),
  rawEarlyDepartureMinutes: integer("raw_early_departure_minutes").notNull().default(0),
  earlyDepartureGraceMinutes: integer("early_departure_grace_minutes").notNull().default(0),
  effectiveEarlyDepartureMinutes: integer("effective_early_departure_minutes").notNull().default(0),
  workedMinutes: integer("worked_minutes").notNull().default(0),
  breakMinutes: integer("break_minutes").notNull().default(0),
  paidBreak: boolean("paid_break").notNull().default(true),
  normalWorkedMinutes: integer("normal_worked_minutes").notNull().default(0),
  overtimeMinutes: integer("overtime_minutes").notNull().default(0),
  workingDay: boolean("working_day").notNull().default(false),
  holiday: boolean("holiday").notNull().default(false),
  attendanceState: text("attendance_state").notNull().default("present"),
  approvedPermissionMinutes: integer("approved_permission_minutes").notNull().default(0),
  permissionCoveredLateMinutes: integer("permission_covered_late_minutes").notNull().default(0),
  permissionCoveredEarlyMinutes: integer("permission_covered_early_minutes").notNull().default(0),
  latePenaltyMinutes: integer("late_penalty_minutes").notNull().default(0),
  earlyDeparturePenaltyMinutes: integer("early_departure_penalty_minutes").notNull().default(0),
  absencePenaltyMinutes: integer("absence_penalty_minutes").notNull().default(0),
  totalPenaltyMinutes: integer("total_penalty_minutes").notNull().default(0),
  explanation: jsonb("explanation").notNull(),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  attendanceUnique: uniqueIndex("var_hr_attendance_calculations_attendance_uidx").on(table.attendanceId),
  companyDateIndex: index("var_hr_attendance_calculations_company_date_idx").on(table.companyId, table.attendanceDate),
}));

export const leaveRequestsTable = pgTable("var_hr_leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  type: text("type").notNull(),
  from: date("from", { mode: "string" }).notNull(),
  to: date("to", { mode: "string" }).notNull(),
  days: numeric("days", { precision: 6, scale: 2, mode: "number" }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  decidedBy: text("decided_by"),
  decisionReason: text("decision_reason"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const permissionRequestsTable = pgTable("var_hr_permission_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  type: text("type").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  decisionReason: text("decision_reason"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const attendanceRulesTable = pgTable("var_hr_attendance_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  workStart: text("work_start").notNull().default("09:00"),
  workEnd: text("work_end").notNull().default("17:00"),
  scheduleName: text("schedule_name").notNull().default("Standard schedule"),
  requiredHours: numeric("required_hours", { precision: 6, scale: 2, mode: "number" }).notNull().default(8),
  graceMinutes: integer("grace_minutes").notNull().default(10),
  earlyCheckoutGraceMinutes: integer("early_checkout_grace_minutes").notNull().default(0),
  overtimeAfterMinutes: integer("overtime_after_minutes").notNull().default(30),
  overtimeEligible: boolean("overtime_eligible").notNull().default(true),
  overtimeMethod: text("overtime_method").notNull().default("multiplier"),
  overtimeMultiplier: numeric("overtime_multiplier", { precision: 6, scale: 3, mode: "number" }).notNull().default(1.25),
  hourlyRateDivisor: integer("hourly_rate_divisor").notNull().default(160),
  lateDeductionMethod: text("late_deduction_method").notNull().default("hourly_rate"),
  lateDeductionFactor: numeric("late_deduction_factor", { precision: 6, scale: 3, mode: "number" }).notNull().default(0.5),
  earlyCheckoutDeductionFactor: numeric("early_checkout_deduction_factor", { precision: 6, scale: 3, mode: "number" }).notNull().default(0.5),
  absenceDeductionMethod: text("absence_deduction_method").notNull().default("daily_rate"),
  absenceDeductionFactor: numeric("absence_deduction_factor", { precision: 6, scale: 3, mode: "number" }).notNull().default(1),
  latePenaltyMultiplier: integer("late_penalty_multiplier").notNull().default(1),
  earlyDeparturePenaltyMultiplier: integer("early_departure_penalty_multiplier").notNull().default(1),
  absencePenaltyMultiplier: integer("absence_penalty_multiplier").notNull().default(1),
  permissionCoversLate: boolean("permission_covers_late").notNull().default(true),
  permissionCoversEarly: boolean("permission_covers_early").notNull().default(true),
  permissionCoveredMinutesMultiplier: integer("permission_covered_minutes_multiplier").notNull().default(0),
  fullDayPermissionMultiplier: integer("full_day_permission_multiplier").notNull().default(0),
  holidayDates: text("holiday_dates").array().notNull().default([]),
  workingDays: text("working_days").array().notNull().default(["Mon", "Tue", "Wed", "Thu", "Sun"]),
  gpsPolicy: text("gps_policy").notNull().default("optional"),
  locationRadiusMeters: integer("location_radius_meters").notNull().default(150),
  version: integer("version").notNull().default(1),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Immutable, effective-dated snapshots of attendanceRulesTable.
 *
 * The legacy table remains for compatibility with existing clients and is
 * maintained as the current-version mirror. All new edits are stored here.
 */
export const attendanceRuleVersionsTable = pgTable("var_hr_attendance_rule_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  version: integer("version").notNull(),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  effectiveTo: date("effective_to", { mode: "string" }),
  status: text("status").notNull().default("active"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  configuration: jsonb("configuration").notNull(),
});

export const leaveBalancesTable = pgTable("var_hr_leave_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  type: text("type").notNull(),
  allocated: numeric("allocated", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
  used: numeric("used", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
  pending: numeric("pending", { precision: 6, scale: 2, mode: "number" }).notNull().default(0),
}, (table) => ({
  employeeTypeUnique: uniqueIndex("var_hr_leave_balances_employee_type_uidx").on(table.companyId, table.employeeId, table.type),
}));

export const leavePoliciesTable = pgTable("var_hr_leave_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  leaveType: text("leave_type").notNull(),
  version: integer("version").notNull().default(1),
  annualEntitlement: numeric("annual_entitlement", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  accrualFrequency: text("accrual_frequency").notNull().default("annual"),
  deductionMode: text("deduction_mode").notNull().default("automatic"),
  carryForwardAllowed: boolean("carry_forward_allowed").notNull().default(false),
  carryForwardDays: numeric("carry_forward_days", { precision: 8, scale: 2, mode: "number" }).notNull().default(0),
  carryForwardExpiryMonths: integer("carry_forward_expiry_months"),
  allowNegative: boolean("allow_negative").notNull().default(false),
  effectiveFrom: date("effective_from", { mode: "string" }).notNull(),
  effectiveTo: date("effective_to", { mode: "string" }),
  status: text("status").notNull().default("active"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyTypeVersion: uniqueIndex("var_hr_leave_policies_company_type_version_uidx").on(table.companyId, table.leaveType, table.version),
  effectiveIndex: index("var_hr_leave_policies_effective_idx").on(table.companyId, table.leaveType, table.effectiveFrom),
}));

export const leaveBalanceTransactionsTable = pgTable("var_hr_leave_balance_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  leaveType: text("leave_type").notNull(),
  amount: numeric("amount", { precision: 8, scale: 2, mode: "number" }).notNull(),
  transactionType: text("transaction_type").notNull(),
  beforeBalance: numeric("before_balance", { precision: 8, scale: 2, mode: "number" }).notNull(),
  afterBalance: numeric("after_balance", { precision: 8, scale: 2, mode: "number" }).notNull(),
  sourceRequestId: uuid("source_request_id").references(() => leaveRequestsTable.id),
  actorId: text("actor_id").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  sourceTypeUnique: uniqueIndex("var_hr_leave_balance_transactions_source_type_uidx").on(table.sourceRequestId, table.transactionType),
  employeeTypeIndex: index("var_hr_leave_balance_transactions_employee_type_idx").on(table.companyId, table.employeeId, table.leaveType, table.createdAt),
}));

export const auditLogsTable = pgTable("var_hr_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  actorType: text("actor_type").notNull().default("system"),
  actorId: text("actor_id").notNull().default("system"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type Attendance = typeof attendanceTable.$inferSelect;
export type AttendanceCalculation = typeof attendanceCalculationsTable.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type LeaveRequest = typeof leaveRequestsTable.$inferSelect;
export type PermissionRequest = typeof permissionRequestsTable.$inferSelect;
export type AttendanceRules = typeof attendanceRulesTable.$inferSelect;
export type AttendanceRuleVersion = typeof attendanceRuleVersionsTable.$inferSelect;
export type LeaveBalance = typeof leaveBalancesTable.$inferSelect;
export type LeavePolicy = typeof leavePoliciesTable.$inferSelect;
export type LeaveBalanceTransaction = typeof leaveBalanceTransactionsTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;

export const organizationRelations = {
  companies: companiesTable,
  departments: departmentsTable,
  branches: branchesTable,
};