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
const deviceConnectorRoute = readFileSync(
  new URL("../src/routes/device-connector.ts", import.meta.url),
  "utf8",
);
const app = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);
const apiStart = readFileSync(
  new URL("../src/index.ts", import.meta.url),
  "utf8",
);
const employeeSchema = readFileSync(
  new URL("../../../lib/db/src/schema/organization.ts", import.meta.url),
  "utf8",
);
const apiMessages = readFileSync(
  new URL("../src/lib/i18n.ts", import.meta.url),
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

test("biometric out-of-order movements refresh stored late minutes", () => {
  const biometricUpdate = route.slice(
    route.indexOf("// Device check-in/check-out buttons are not reliable"),
    route.indexOf("function payrollPeriodResponse"),
  );
  assert.match(
    biometricUpdate,
    /workedHours: metrics\.workedHours,[\s\S]*overtimeHours: metrics\.overtimeHours,[\s\S]*lateMinutes: metrics\.lateMinutes/,
  );
});

test("grace minutes exempt the full delay instead of reducing it", () => {
  assert.match(
    route,
    /const lateMinutes =\s*rawLateMinutes > input\.schedule\.graceMinutes \? rawLateMinutes : 0;/,
  );
  assert.match(
    route,
    /const earlyCheckoutMinutes =\s*rawEarlyDepartureMinutes > input\.schedule\.earlyCheckoutGraceMinutes\s*\? rawEarlyDepartureMinutes\s*:\s*0;/,
  );
  assert.match(
    route,
    /const workedMinutes =[\s\S]*input\.checkOut\.getTime\(\) - input\.checkIn\.getTime\(\)/,
  );
});

test("late penalty multipliers are applied once in payroll deductions", () => {
  const start = route.indexOf("const lateDeduction =");
  const end = route.indexOf("const earlyDeduction =", start);
  assert.ok(start >= 0 && end > start);
  const lateDeduction = route.slice(start, end);
  assert.match(
    lateDeduction,
    /moneyValue\(\(latePenaltyMinutes \/ 60\) \* hourlyRate\)/,
  );
  assert.match(
    lateDeduction,
    /fixed_per_minute[\s\S]*?moneyValue\(latePenaltyMinutes\)/,
  );
  assert.doesNotMatch(lateDeduction, /latePenaltyMultiplier/);
});

test("attendance rule changes refresh historical editable payroll with current rules, without touching approvals", () => {
  assert.match(route, /async function recalculateOpenPayrollPeriodsForRuleChange/);
  assert.match(
    route,
    /includeFuturePeriods\s*\?\s*eq\(payrollPeriodsTable\.companyId, context\.companyId\)\s*:\s*and\(\s*eq\(payrollPeriodsTable\.companyId, context\.companyId\),\s*lte\(payrollPeriodsTable\.from, TODAY\)/,
  );
  assert.doesNotMatch(
    route.slice(
      route.indexOf("async function recalculateOpenPayrollPeriodsForRuleChange"),
      route.indexOf("type SyncHistoryStatus"),
    ),
    /gte\(payrollPeriodsTable\.to/,
  );
  assert.match(
    route,
    /period\.status !== "calculated"[\s\S]*isPayrollPeriodImmutableStatus\(period\.status\)/,
  );
  assert.match(
    route,
    /return status === "finalized" \|\| status === "approved" \|\| status === "locked"/,
  );
  assert.match(
    route,
    /recalculateOpenPayrollPeriodsForRuleChange\(\s*context,\s*req,?\s*\)/,
  );
  assert.match(route, /const useCurrentRules = !isPayrollPeriodImmutableStatus\(period\.status\)/);
  assert.match(
    route,
    /attendanceRulesFor\(context\.companyId, date, useCurrentRules\)/,
  );
  assert.match(
    route,
    /attendanceCalculationFor\(\s*context,\s*item\.attendance,\s*false,\s*useCurrentRules/,
  );
  assert.match(route, /Current attendance rules applied to this editable payroll period/);
  assert.match(app, /root\.startsWith\("\/api\/payroll\/"\)/);
});

test("attendance calculations keep the schedule stored on the attendance record", () => {
  assert.match(route, /function scheduleForAttendanceCalculation/);
  assert.match(
    route,
    /startTime: attendance\.scheduledStart,[\s\S]*endTime: attendance\.scheduledEnd/,
  );
  assert.match(route, /source: "attendance_record"/);
  assert.match(
    route,
    /const schedule = scheduleForAttendanceCalculation\(attendance, resolvedSchedule\)/,
  );
  assert.match(
    route,
    /\.insert\(attendanceTable\)[\s\S]*?\.returning\(\)[\s\S]*?attendanceCalculationFor\(context, created, true\)/,
  );
  assert.match(
    route,
    /\.update\(attendanceTable\)[\s\S]*?\.returning\(\)[\s\S]*?attendanceCalculationFor\(context, updated, true\)/,
  );
});

test("schedule changes rebase movement records only in editable payroll periods", () => {
  const refreshStart = route.indexOf(
    "async function recalculateAttendanceForScheduleChanges",
  );
  const refreshEnd = route.indexOf("type SyncHistoryStatus", refreshStart);
  const refresh = route.slice(refreshStart, refreshEnd);
  assert.notEqual(refreshStart, -1);
  assert.match(
    refresh,
    /coveringPeriods\.some\(\(period\) =>\s*isPayrollPeriodImmutableStatus\(period\.status\)/,
  );
  assert.match(refresh, /scheduledStart: schedule\.startTime/);
  assert.match(refresh, /scheduledEnd: schedule\.endTime/);
  assert.match(refresh, /requiredHours: schedule\.requiredHours/);
  assert.match(refresh, /attendanceCalculationFor\(context, updated, true\)/);
  assert.doesNotMatch(refresh, /if\s*\(!periods\.some/);
  assert.doesNotMatch(refresh, /!coveringPeriods\.length/);
  assert.match(
    refresh,
    /period\.status === "calculated"[\s\S]*calculatePayrollPeriod\(context, req, period\)/,
  );

  const assignmentRouteStart = route.indexOf(
    'router.put(\n  "/employees/:employeeId/schedule"',
  );
  const assignmentRouteEnd = route.indexOf('router.get("/holidays"', assignmentRouteStart);
  assert.match(
    route.slice(assignmentRouteStart, assignmentRouteEnd),
    /recalculateAttendanceForScheduleChanges/,
  );
  assert.match(
    route.slice(
      route.indexOf('router.patch("/schedules/:scheduleId"'),
      route.indexOf('router.put(\n  "/schedules/:scheduleId/default"'),
    ),
    /recalculateAttendanceForScheduleChanges/,
  );
  assert.match(
    route.slice(
      route.indexOf('router.post("/schedule-assignments"'),
      route.indexOf('router.get(\n  "/employees/:employeeId/schedule"'),
    ),
    /recalculateAttendanceForScheduleChanges/,
  );
  assert.doesNotMatch(
    app,
    /employeeSchedule\.data\?\.assignment\?\.scheduleId ===\s*editForm\.scheduleId/,
  );
  assert.match(app, /assignSchedule\.mutate\(/);
  assert.match(app, /query\.queryKey\[0\]\.startsWith\("\/api\/payroll\/"\)/);
});

test("annual leave is deducted only for explicit leave approval or manager conversion", () => {
  assert.doesNotMatch(
    route,
    /applyAutomaticAbsenceAnnualLeave|applyApprovedPermissionAnnualLeave|permission_leave:\$\{request\.id\}/,
  );
  assert.match(
    route,
    /const deductOnApproval =\s*isAnnualLeaveType\(request\.type\) \|\| policy\?\.deductionMode !== "manual"/,
  );
  assert.match(
    route,
    /used: sql`\$\{leaveBalancesTable\.used\} \+ \$\{request\.days\}`/,
  );
  assert.match(route, /Converted absence on \$\{row\.attendance\.date\} to annual leave/);
  assert.match(route, /status: "approved"/);
  assert.match(app, /annualLeaveDeductionOnlyExplicit/);
  const annualLeaveSettings = app.slice(
    app.indexOf('<Card className="order-4 p-6">'),
    app.indexOf('<h3 className="mt-6 font-semibold">{t("annualLeaveBalances")}</h3>'),
  );
  assert.doesNotMatch(annualLeaveSettings, /absenceDeductsAnnualLeave|absenceLeaveDeductionDays/);
  assert.doesNotMatch(
    annualLeaveSettings,
    /monthlyMaximumDeduction|balanceDeductionMonths/,
  );
  assert.match(app, /function isAnnualLeavePolicy/);
  assert.match(app, /t\("deductOnApproval"\)/);
  assert.match(
    app,
    /deductionMode: isAnnualLeavePolicy\(policyForm\.leaveType\)\s*\?\s*"automatic"/,
  );
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

test("manual absence conversion decrements annual leave by one day", () => {
  assert.match(
    route,
    /\.set\(\{ used: sql`\$\{leaveBalancesTable\.used\} \+ 1` \}\)/,
  );
  assert.match(
    route,
    /const afterBalance = updatedBalance\.allocated - updatedBalance\.used/,
  );
  assert.match(route, /balanceRemaining: afterBalance/);
});

test("annual eligibility controls allocation but does not gate explicit manual conversion", () => {
  assert.match(route, /calculateEligibleAnnualLeaveAllocation/);
  assert.doesNotMatch(route, /if \(!employee\?\.automaticAnnualLeaveEligible\) return 0;/);
  assert.match(app, /automaticAnnualLeaveEligible:\s*form\.automaticAnnualLeaveEligible/);
  assert.match(app, /automaticAnnualLeaveEligible:\s*editForm\.automaticAnnualLeaveEligible/);
});

test("payroll materializes scheduled absences without replacing approved leave", () => {
  assert.match(route, /synchronizePayrollAttendance/);
  assert.match(route, /scheduleFallbacksForCompany/);
  assert.match(route, /departmentDefaults\.get\(departmentId\)/);
  assert.match(route, /companyDefault/);
  assert.match(route, /existingAttendance\.source === "payroll_sync"/);
  assert.match(route, /scheduledStart: schedule\.startTime/);
  assert.match(route, /Automatically materialized as absent during payroll synchronization/);
  assert.match(route, /!isWorkingScheduleDay\(schedule, date\)/);
  assert.match(route, /approvedLeaves\.some/);
  assert.match(route, /approvedPermissions\.some/);
  assert.match(route, /attendanceDeductions/);
  assert.match(route, /netSalary/);
  assert.match(route, /calculationVersion/);
  assert.match(route, /inputsSnapshot/);
  assert.match(app, /data-testid="button-install-pwa"/);
  assert.doesNotMatch(app, /fixed bottom-24 z-40 min-h-12/);
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

test("employee payroll preview uses the selected start and end dates", () => {
  assert.match(
    route,
    /from\?: string;[\s\S]*through\?: string;[\s\S]*const calculationPeriod = \{[\s\S]*from: options\.from \?\? period\.from/,
  );
  assert.match(
    route,
    /calculatePayrollPeriod\(context, req, calculationPeriod, \{[\s\S]*from: query\.data\.from,[\s\S]*through: query\.data\.to/,
  );
  assert.match(route, /const fullPeriodDates = dateStrings\(period\.from, period\.to\)/);
});

test("leave balances expose configured leave-year boundaries and states", () => {
  assert.match(route, /leavePeriodBounds/);
  assert.match(route, /periodStartMonth/);
  assert.match(
    route,
    /canUseCapability\(context, "leave\.view", true\)[\s\S]*canUseCapability\(context, "employees\.view", true\)/,
  );
  assert.match(route, /const allocated = balance\.allocated/);
  assert.match(route, /total: allocated/);
  assert.match(route, /absenceDeducted/);
  assert.match(route, /remaining: allocated - balance\.used - balance\.pending/);
  assert.match(route, /deductedThisMonth/);
  assert.match(route, /unauthorizedAbsenceDays/);
  assert.match(app, /leaveYearStartsIn/);
  assert.match(app, /label=\{t\("deductedForAbsence"\)\}/);
  assert.match(app, /label=\{t\("deductedThisMonth"\)\}/);
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
  assert.match(route, /calculateEligibleAnnualLeaveAllocation/);
  assert.match(route, /set\(\{ allocated: annualEntitlement \}\)/);
  assert.match(route, /monthStart/);
  assert.match(route, /change\.oldValue/);
  assert.match(route, /effectiveLeavePolicy\([\s\S]*request\.from/);
  assert.doesNotMatch(route, /attendanceRulesFor\(context\.companyId, request\.date\)/);
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

test("platform database editing is restricted to configured fields and wired to the UI", () => {
  assert.match(
    platformAdminRoute,
    /router\.patch\(\s*"\/platform\/database\/:entity\/:id"/,
  );
  assert.match(platformAdminRoute, /if \(!config\.editable\.length\)/);
  assert.match(platformAdminRoute, /action: "database_updated"/);
  assert.match(app, /const editFields = data/);
  assert.match(app, /const endpoint = usesSupportEditor/);
  assert.match(
    app,
    /values: valuesToSave,\s*companyId: scopeCompanyId,\s*reason: editReason\.trim\(\)/,
  );
  assert.match(app, /String\(editValues\[key\][\s\S]*String\(editing\[key\]/);
  assert.match(app, /supportWorkdaysInvalid/);
  assert.match(app, /cause instanceof Error && cause\.message !== "Request failed\."/);
  assert.match(platformAdminRoute, /reason: z\.string\(\)\.trim\(\)\.min\(10\)/);
  assert.match(platformAdminRoute, /work_days_per_month/);
  assert.match(app, /String\(entry\.metadata\.reason\)/);
  assert.match(
    route,
    /export async function refreshPlatformSupportPayroll\([\s\S]*?return recalculateOpenPayrollPeriodsForRuleChange\(context, req, true\);/,
  );
});

test("platform owner can adjust annual leave total without changing usage", () => {
  assert.match(
    platformAdminRoute,
    /router\.patch\(\s*"\/platform\/leave-balances\/:id\/support"/,
  );
  assert.match(
    platformAdminRoute,
    /const context = await requirePlatformOwner\(req\)/,
  );
  assert.match(platformAdminRoute, /if \(!\["annual", "annual leave"\]/);
  assert.match(platformAdminRoute, /\.set\(\{ allocated \}\)/);
  assert.match(platformAdminRoute, /transactionType: "manual_adjustment"/);
  assert.match(platformAdminRoute, /used: roundDays\(Number\(updated\.used\)\)/);
  assert.match(platformAdminRoute, /entityType: "leave_balance"/);
  assert.match(app, /leave_balances: "databaseLeaveBalances"/);
  assert.match(app, /data\.key === "leave_balances"/);
  assert.match(app, /annualLeaveTotalHint/);
  assert.match(app, /\/api\/platform\/leave-balances\/\$\{balanceEditing\.id\}\/support/);
});

test("USB connector ingestion is device-key protected and idempotent", () => {
  assert.match(
    deviceConnectorRoute,
    /"\/connector\/v1\/devices\/:deviceId\/events"/,
  );
  assert.match(deviceConnectorRoute, /x-var-hr-registration-key/);
  assert.match(deviceConnectorRoute, /onConflictDoNothing/);
  assert.match(deviceConnectorRoute, /applyProviderAttendanceEvent/);
  assert.match(deviceConnectorRoute, /providerKey: "zkteco-usb"/);
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
  assert.match(route, /lateMinutes: calculation\.effectiveLateMinutes/);
  assert.match(route, /earlyCheckoutMinutes: calculation\.effectiveEarlyDepartureMinutes/);
  assert.match(route, /const attendanceStatus =[\s\S]*calculation\.effectiveLateMinutes > 0/);
  assert.match(route, /!filters\.attendanceStatus \|\|\s*row\.attendanceStatus === filters\.attendanceStatus/);
  assert.match(route, /deductedMinutes: calculation\.finalPenaltyMinutes/);
  assert.match(route, /doublePay: calculation\.appliedOvertimeMultiplier >= 2/);
  assert.match(spec, /scheduledStart: \{ type: string \}/);
  assert.match(spec, /biometricCode: \{ type: \["string", "null"\]/);
});

test("attendance movement shows overtime multipliers only for actual overtime", () => {
  assert.match(app, /t\("overtimeMultiplier"\)/);
  assert.match(
    app,
    /Number\(row\.overtimeHours \|\| 0\) > 0[\s\S]*row\.overtimeMultiplier/,
  );
  assert.match(app, /: "—"/);
  assert.doesNotMatch(app, /<th className="px-4 py-3">\{t\("doublePay"\)\}<\/th>/);
});

test("actual overtime minutes stay visible while payable overtime remains gated", () => {
  assert.match(
    route,
    /function overtimeMinutesAfterScheduleEnd[\s\S]*const rawOvertimeMinutes = input\.holiday[\s\S]*overtimeMinutesAfterScheduleEnd[\s\S]*const overtimeMinutes =\s*rawOvertimeMinutes >= input\.schedule\.overtimeAfterMinutes/,
  );
  assert.match(
    route,
    /const rawAutomaticOvertimeMinutes = hourlyEmployee\s*\?\s*0\s*:\s*holiday[\s\S]*overtimeMinutesAfterScheduleEnd[\s\S]*const automaticOvertimeMinutes =\s*calculationSchedule\.overtimeEligible[\s\S]*rawAutomaticOvertimeMinutes >= calculationSchedule\.overtimeAfterMinutes/,
  );
  assert.match(route, /const finalOvertimeMinutes = hourlyEmployee\s*\?\s*0/);
  assert.match(
    route,
    /overtimeHours: Number\(\(finalOvertimeMinutes \/ 60\)\.toFixed\(2\)\)/,
  );
  assert.match(route, /overtimeMinutes: calculation\.originalOvertimeMinutes/);
  assert.match(
    route,
    /const calculation = await attendanceCalculationFor\(\s*context,\s*row\.attendance,\s*false,\s*\)/,
  );
  assert.match(
    route,
    /const allAttendanceCalculations = await Promise\.all\(\s*attendance\.map\(\(item\) =>\s*attendanceCalculationFor\(\s*context,\s*item\.attendance,\s*false,\s*useCurrentRules/,
  );
});

test("employee reference hours are positive and bounded on create and edit", () => {
  assert.match(app, /label=\{t\("referenceHoursPerDay"\)\}[\s\S]*min=\{0\.01\}[\s\S]*max=\{24\}/);
  assert.match(
    app,
    /Number\(editForm\.workingHours\) <= 0/,
  );
  assert.match(app, /Number\(form\.workingHours\) <= 0/);
});

test("monthly and hourly compensation rates use employee reference workdays and hours", () => {
  assert.match(
    route,
    /hourlyRate = deriveHourlyRate\(\s*row\.employee\.salary,\s*referenceWorkdays,\s*row\.employee\.workingHours,/,
  );
  assert.match(
    route,
    /const dailyRate = row\.employee\.salary \/ referenceWorkdays;/,
  );
  assert.match(
    route,
    /const hourlyRate = deriveHourlyRate\(\s*row\.employee\.salary,\s*row\.employee\.workDaysPerMonth,\s*row\.employee\.workingHours,/,
  );
  assert.doesNotMatch(route, /movementScheduledDayCount/);
  assert.match(app, /workDaysPerMonth: Number\(form\.workDaysPerMonth\)/);
  assert.match(app, /workDaysPerMonth: Number\(editForm\.workDaysPerMonth\)/);
  assert.match(
    app,
    /const dailyRate =\s*referenceWorkdays > 0[\s\S]*monthlySalary \/ referenceWorkdays/,
  );
});

test("employee creation and import require explicit reference workdays", () => {
  assert.match(
    employeeSchema,
    /workDaysPerMonth: integer\("work_days_per_month"\)(?:,|\n)/,
  );
  assert.doesNotMatch(employeeSchema, /workDaysPerMonth:.*default\(26\)/);
  assert.doesNotMatch(
    apiStart,
    /Backfilled reference workdays|workDaysPerMonth: 26/,
  );
  assert.match(route, /const workDaysPerMonth = parsed\.data\.workDaysPerMonth;/);
  assert.doesNotMatch(route, /workDaysPerMonth[^\n]*\?\?\s*26/);
  assert.match(route, /nextWorkDaysPerMonth === null/);
  assert.match(route, /workdayspermonth: "workDaysPerMonth"/);
  assert.match(route, /workDaysPerMonth: Number\(workDaysValue\)/);
  assert.match(
    route,
    /!Number\.isInteger\(Number\(workDaysValue\)\)[\s\S]*Number\(workDaysValue\) > 31/,
  );
  assert.match(app, /workdayspermonth: "workDaysPerMonth"/);
  assert.match(
    app,
    /importRequiredHeaders = \[[\s\S]*"workDaysPerMonth"/,
  );
  assert.match(
    app,
    /name="workDaysPerMonth"[\s\S]*required[\s\S]*value=\{form\.workDaysPerMonth\}/,
  );
  assert.match(
    app,
    /label=\{t\("referenceWorkdaysPerMonth"\)\}[\s\S]*type="number"\s+required/,
  );
  assert.match(spec, /workDaysPerMonth: \{ type: integer, minimum: 1, maximum: 31 \}/);
  assert.match(
    spec,
    /EmployeeInput:[\s\S]*required:[\s\S]*workDaysPerMonth[\s\S]*EmployeeUpdate:/,
  );
  assert.doesNotMatch(spec, /workDaysPerMonth:.*default: 26/);
  assert.match(
    app,
    /workDaysPerMonth: ""[\s\S]*workDaysPerMonth: ""/,
  );
});

test("hourly payroll translations include all parameters in every API locale", () => {
  for (const locale of ["en", "ar", "fr", "de"]) {
    const localeBlock =
      apiMessages.match(
        new RegExp(`\\n  ${locale}: \\{([\\s\\S]*?)\\n  \\},`),
      )?.[1] ?? "";
    assert.match(localeBlock, /hourlyWages:\s*"[^"]+"/);
    assert.match(
      localeBlock,
      /hourlyWagesExplanation:\s*"[^"]*\{hours\}[^"]*\{rate\}[^"]*"/,
    );
  }
});

test("hourly employee movement clears irrelevant fixed schedule times", () => {
  assert.match(app, /hourlyEmployee\s*\?\s*\{/);
  assert.match(app, /scheduledStart: "",\s*scheduledEnd: ""/);
  assert.match(
    app,
    /payBasis=\{employee\.data\.payBasis \?\? "monthly"\}/,
  );
});

test("work schedules render as separated cards with grouped responsive details", () => {
  const schedulesStart = app.indexOf("function Schedules(");
  const schedulesEnd = app.indexOf("function SchedulesRoute", schedulesStart);
  const schedulesView = app.slice(schedulesStart, schedulesEnd);
  assert.notEqual(schedulesStart, -1);
  assert.notEqual(schedulesEnd, -1);
  assert.match(schedulesView, /<div className="space-y-3">/);
  assert.match(schedulesView, /t\("scheduleListTitle"\)/);
  assert.match(schedulesView, /variant="secondary"/);
  assert.match(schedulesView, /bg-emerald-500\/10 text-emerald-700/);
  assert.match(schedulesView, /data-testid=\{`card-work-schedule-\$\{schedule\.id\}`\}/);
  assert.match(schedulesView, /data-testid=\{`button-edit-schedule-\$\{schedule\.id\}`\}/);
  assert.match(schedulesView, /grid-cols-2 gap-2 border-t border-border\/70 pt-4 sm:grid-cols-3/);
  assert.doesNotMatch(schedulesView, /divide-y divide-border/);
});

test("employee attendance movement starts with the first day of the month", () => {
  assert.match(
    app,
    /const rows = \[\.\.\.\(report\.data\?\.rows \?\? \[\]\)\][\s\S]*?\.sort\(\(a, b\) =>[\s\S]*\(a\.date \?\? ""\)\.localeCompare\(b\.date \?\? ""\)/,
  );
});

test("attendance movement calculation refreshes both report rows and payroll totals", () => {
  assert.match(
    app,
    /async function recalculateAttendanceMovement\(\)[\s\S]*Promise\.all\(\[report\.refetch\(\), payrollSummary\.refetch\(\)\]\)/,
  );
  assert.match(
    app,
    /onClick=\{\(\) => void recalculateAttendanceMovement\(\)\}/,
  );
  assert.match(
    app,
    /report\.isFetching \|\| payrollSummary\.isFetching \|\| summaryTo < from/,
  );
});

test("printed attendance movement localizes status and totals late minutes", () => {
  assert.match(
    app,
    /statusLabel\(row\.attendanceStatus \|\| "—", t\)/,
  );
  assert.match(
    app,
    /t\("lateMinutes"\)[\s\S]*rows\.reduce\(\(sum, row\) => sum \+ Number\(row\.lateMinutes \|\| 0\)/,
  );
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