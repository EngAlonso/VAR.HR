import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const app = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);
const leaveBalanceLogic = readFileSync(
  new URL("../src/lib/annual-leave-balance.mjs", import.meta.url),
  "utf8",
);
const spec = readFileSync(
  new URL("../../../lib/api-spec/openapi.yaml", import.meta.url),
  "utf8",
);

test("attendance rules expose effective-dated holiday and weekly multipliers", () => {
  assert.match(route, /holidayMultiplierForDate/);
  assert.match(route, /weeklyMultiplierForDate/);
  assert.match(route, /overtimeMultiplierForDate/);
  assert.match(route, /b\.multiplier - a\.multiplier/);
  assert.match(route, /only the highest applicable holiday\/weekly multiplier/);
  assert.match(spec, /holidayPeriods:/);
  assert.match(spec, /weeklyMultipliers:/);
});

test("absence-to-annual-leave deduction is explicit and idempotent", () => {
  assert.match(route, /absenceDeductsAnnualLeave/);
  assert.match(route, /absenceLeaveDeductionDays/);
  assert.match(route, /calculateAnnualLeaveDeduction/);
  assert.match(route, /absenceKind: "approved_permission"/);
  assert.match(route, /permission_leave:\$\{request\.id\}/);
  assert.doesNotMatch(route, /const shouldDeductAnnualLeave = true/);
  assert.match(leaveBalanceLogic, /absenceKind !== "approved_permission"/);
  assert.match(leaveBalanceLogic, /attendanceState !== "unexcused_absence"/);
  assert.match(route, /transactionType: "deduction"/);
  assert.match(route, /absence_leave_reversal:\$\{attendance\.id\}/);
  assert.match(route, /transactionType: "restoration"/);
  assert.match(route, /onConflictDoNothing\(\)/);
  assert.match(app, /function AnnualLeaveControls\(\)/);
  assert.match(app, /function Rules\(\)[\s\S]*<AnnualLeaveControls \/>/);
  assert.match(app, /annualLeaveSettings/);
  assert.match(app, /balanceDeductionMonths/);
});

test("payroll materializes scheduled absences without replacing approved leave", () => {
  assert.match(route, /synchronizePayrollAttendance/);
  assert.match(route, /Automatically materialized as absent during payroll synchronization/);
  assert.match(route, /!isWorkingScheduleDay\(schedule, date\)/);
  assert.match(route, /approvedLeaves\.some/);
  assert.match(route, /approvedPermissions\.some/);
  assert.match(route, /attendanceDeductions/);
  assert.match(route, /netSalary/);
  assert.match(route, /calculationVersion/);
  assert.match(route, /inputsSnapshot/);
});

test("leave balances expose configured leave-year boundaries and states", () => {
  assert.match(route, /leavePeriodBounds/);
  assert.match(route, /periodStartMonth/);
  assert.match(route, /total: balance\.allocated/);
  assert.match(route, /absenceDeducted/);
  assert.match(route, /remaining: balance\.allocated - balance\.used - balance\.pending/);
  assert.match(route, /deductedThisMonth/);
  assert.match(route, /unauthorizedAbsenceDays/);
  assert.match(app, /leaveYearStartsIn/);
  assert.match(app, /label="Annual balance"/);
  assert.match(app, /label="Deducted for absence"/);
  assert.match(app, /label="Deducted this month"/);
});

test("attendance rules and leave balances share the policy contract", () => {
  assert.match(spec, /annualLeaveEntitlement:/);
  assert.match(spec, /annualLeavePeriodStartMonth:/);
  assert.match(spec, /absenceLeaveDeductionTrigger:/);
  assert.match(spec, /absenceLeaveDeductionDays:/);
  assert.match(spec, /absenceDeducted:/);
  assert.match(route, /annualLeavePolicyFor/);
  assert.match(route, /isAnnualLeaveType/);
  assert.match(route, /effectiveLeavePolicy\([\s\S]*request\.from/);
  assert.match(route, /attendanceRulesFor\(context\.companyId, request\.date\)/);
  assert.match(route, /rulesByDate/);
});

test("employee imports create an effective default shift assignment", () => {
  assert.match(route, /router\.post\("\/employees\/import"/);
  assert.match(route, /department\?\.defaultScheduleId/);
  assert.match(route, /company\[0\]\?\.defaultScheduleId/);
  assert.match(route, /tx\.insert\(employeeScheduleAssignmentsTable\)/);
  assert.match(route, /effectiveFrom: prepared\.values\.joinedOn/);
});

test("holiday administration supports date ranges, enablement, and multipliers", () => {
  assert.match(route, /endDate: parsed\.data\.endDate/);
  assert.match(route, /multiplier: parsed\.data\.multiplier/);
  assert.match(route, /enabled: parsed\.data\.enabled/);
  assert.match(app, /End date \(optional\)/);
  assert.match(app, /Extra-pay multiplier/);
});