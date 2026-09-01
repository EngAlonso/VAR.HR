import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const authRoute = readFileSync(
  new URL("../src/routes/auth.ts", import.meta.url),
  "utf8",
);
const platformAdminRoute = readFileSync(
  new URL("../src/routes/platform-admin.ts", import.meta.url),
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
const executableRoute = route.replace(/\/\*[\s\S]*?\*\//g, "");

test("attendance rules expose calendar multipliers", () => {
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
  assert.match(executableRoute, /attendanceRuleChangesTable/);
  assert.match(executableRoute, /appliesFromMonth/);
  assert.match(executableRoute, /router\.get\("\/rules\/changes"/);
  assert.match(executableRoute, /router\.put\("\/rules"/);
  assert.doesNotMatch(executableRoute, /router\.get\("\/rules\/versions"/);
  assert.doesNotMatch(executableRoute, /router\.post\("\/rules\/versions"/);
  assert.match(app, /function Rules\(\)/);
  assert.doesNotMatch(app, /<AnnualLeaveControls \/>/);
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

test("payroll employee details expose calculated absence days", () => {
  assert.match(
    route,
    /snapshot\.attendance\?\.absentDays[\s\S]*row\.calculation\.absentDays/,
  );
  assert.match(route, /absentDays: calculatedAbsenceDays/);
  assert.match(app, /t\("absentDays"\)/);
  assert.match(app, /t\("missingHours"\)/);
});

test("leave balances expose configured leave-year boundaries and states", () => {
  assert.match(route, /leavePeriodBounds/);
  assert.match(route, /periodStartMonth/);
  assert.match(
    route,
    /canUseCapability\(context, "leave\.view", true\)[\s\S]*canUseCapability\(context, "employees\.view", true\)/,
  );
  assert.match(route, /const allocated = isAnnualLeaveType\(balance\.type\)/);
  assert.match(route, /total: allocated/);
  assert.match(route, /absenceDeducted/);
  assert.match(route, /remaining: allocated - balance\.used - balance\.pending/);
  assert.match(route, /deductedThisMonth/);
  assert.match(route, /unauthorizedAbsenceDays/);
  assert.match(app, /leaveYearStartsIn/);
  assert.match(app, /label="Annual balance"/);
  assert.match(app, /label="Deducted for absence"/);
  assert.match(app, /label="Deducted this month"/);
  assert.match(app, /function EmployeeProfilePage\(\)/);
  assert.match(app, /text-profile-annual-total-\$\{employee\.data\.id\}/);
});

test("attendance rules and leave balances share the policy contract", () => {
  assert.match(spec, /annualLeaveEntitlement:/);
  assert.match(spec, /annualLeavePeriodStartMonth:/);
  assert.match(spec, /absenceLeaveDeductionTrigger:/);
  assert.match(spec, /absenceLeaveDeductionDays:/);
  assert.match(spec, /absenceDeducted:/);
  assert.match(route, /annualLeavePolicyFor/);
  assert.match(route, /isAnnualLeaveType/);
  assert.match(route, /currentAnnualLeaveEntitlement/);
  assert.match(route, /set\(\{ allocated: annualEntitlement \}\)/);
  assert.match(route, /monthStart/);
  assert.match(route, /change\.oldValue/);
  assert.match(route, /effectiveLeavePolicy\([\s\S]*request\.from/);
  assert.match(route, /attendanceRulesFor\(context\.companyId, request\.date\)/);
  assert.match(route, /attendanceRuleChangesTable/);
});

test("attendance rule change history is restricted to company owners", () => {
  assert.match(
    executableRoute,
    /router\.get\("\/rules\/changes"[\s\S]*context\.role !== "company_owner"/,
  );
  assert.match(app, /const canViewRuleHistory = account\.accountType === "company_owner"/);
  assert.match(app, /useListAttendanceRuleChanges\(\{\s*query: \{ enabled: canViewRuleHistory \}/);
  assert.match(app, /\{canViewRuleHistory && \(\s*<Card className="order-9 p-6">/);
});

test("platform company details expose the complete activity timeline with actor names", () => {
  const detailsStart = authRoute.indexOf(
    '"/platform/companies/:companyId/details"',
  );
  const detailsRoute = authRoute.slice(
    detailsStart,
    authRoute.indexOf(
      '"/platform/companies/:companyId/owners"',
      detailsStart,
    ),
  );
  assert.match(detailsRoute, /actorName/);
  assert.doesNotMatch(detailsRoute, /auditLogsTable\.createdAt\)\s*\.limit\(/);
  assert.doesNotMatch(detailsRoute, /authAuditEventsTable\.createdAt\)\s*\.limit\(/);
  assert.match(app, /platformActivityActionLabels/);
  assert.match(app, /platformActivityEntityLabels/);
  assert.match(app, /details\.activity\.map\(\(event\) =>/);
  assert.doesNotMatch(app, /details\.activity\.slice\(0, 20\)/);
});

test("platform activity card translates its labels for every supported locale", () => {
  assert.match(app, /en: "Recent platform activity"/);
  assert.match(app, /ar: "نشاط المنصة الأخير"/);
  assert.match(app, /fr: "Activité récente de la plateforme"/);
  assert.match(app, /de: "Letzte Plattformaktivitäten"/);
  assert.match(app, /platformActivityLabel\(locale, "action", event\.action\)/);
  assert.match(app, /href="\/platform\/activity"/);
  assert.match(app, /function PlatformActivityPage\(\)/);
  assert.match(app, /value\.startsWith\("database:"\)/);
});

test("platform database search uses SQL string literals safely", () => {
  assert.match(platformAdminRoute, /function sqlStringLiteral\(value: string\)/);
  assert.match(
    platformAdminRoute,
    /ILIKE \$\{sqlStringLiteral\(`%\$\{search\}%`\)\}/,
  );
  assert.doesNotMatch(platformAdminRoute, /ILIKE \$\{JSON\.stringify/);
});

test("working days are configured in attendance rules, not shifts", () => {
  assert.match(app, /workingDaysTitle/);
  assert.match(app, /workingDaysDetail/);
  assert.doesNotMatch(app, /checked=\{draft\.workingDays\.includes\(day\)\}/);
  assert.match(route, /workingDays: rules\.workingDays/);
  assert.match(spec, /workingDays:[\s\S]*minItems: 1[\s\S]*enum: \[Sun, Mon, Tue, Wed, Thu, Fri, Sat\]/);
});

test("employee movement records expose monthly calculated attendance details", () => {
  assert.match(app, /function EmployeeAttendanceMovement/);
  assert.match(app, /useGetReport\(reportParams/);
  assert.match(app, /button-print-attendance-movement/);
  assert.match(app, /canPrint/);
  assert.match(route, /canUseCapability\(context, "attendance\.view"\)/);
  assert.match(route, /canUseCapability\(context, "employees\.view"\)/);
  assert.match(route, /context\.role === "employee"[\s\S]*query\.data\.type === "attendance"/);
  assert.match(route, /deductedMinutes: calculation\.finalPenaltyMinutes/);
  assert.match(route, /doublePay: calculation\.appliedOvertimeMultiplier >= 2/);
  assert.match(spec, /scheduledStart: \{ type: string \}/);
  assert.match(spec, /biometricCode: \{ type: \["string", "null"\]/);
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