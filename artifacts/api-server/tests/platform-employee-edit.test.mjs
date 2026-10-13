import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/platform-admin.ts", import.meta.url),
  "utf8",
);
const app = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);

test("platform employee editor loads the same company-scoped profile inputs", () => {
  const supportGet = route.slice(
    route.indexOf('"/platform/database/employees/:id/support"'),
    route.indexOf('router.patch(\n  "/platform/database/:entity/:id"'),
  );
  for (const field of [
    "employee_number",
    "first_name_en",
    "national_id",
    "biometric_code",
    "working_hours",
    "pay_basis",
    "work_days_per_month",
    "salary",
    "joined_on",
    "department_id",
    "branch_id",
    "location_attendance_enabled",
    "automatic_annual_leave_eligible",
  ]) {
    assert.match(
      supportGet,
      new RegExp(`${field}:\\s*employee\\.`),
    );
  }
  assert.match(supportGet, /currentScheduleId/);
  assert.match(supportGet, /departments,/);
  assert.match(supportGet, /branches,/);
  assert.match(supportGet, /schedules: availableSchedules/);
  assert.match(app, /\/api\/platform\/database\/employees\/\$\{encodeURIComponent\(String\(row\.id\)\)\}\/support/);
  assert.match(app, /<EmployeeAttendanceLocationMode/);
  assert.match(app, /automaticAnnualLeaveEligibleHint/);
  assert.match(app, /calculatedHourlyRate/);
});

test("platform employee saves validate company scope, reason, account, payroll, and shift effects", () => {
  assert.match(route, /const employeeSupportEditSchema = supportEditSchema/);
  assert.match(route, /scheduleAssignment: z/);
  assert.match(route, /employeeValues/);
  assert.match(route, /Employee references must belong to the selected company/);
  assert.match(route, /employeeNumber/);
  assert.match(route, /userAccountsTable\.username/);
  assert.match(route, /automaticAnnualLeaveActivatedAt/);
  assert.match(route, /refreshPlatformSupportPayroll\(/);
  assert.match(route, /refreshPlatformSupportSchedule\(/);
  assert.match(route, /reason: parsed\.data\.reason/);
  assert.match(app, /reason: editReason\.trim\(\),\s*\.\.\.\(scheduleAssignment/);
});
