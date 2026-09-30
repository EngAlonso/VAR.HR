import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const auth = readFileSync(
  new URL("../src/lib/auth.ts", import.meta.url),
  "utf8",
);
const tenantContext = readFileSync(
  new URL("../src/lib/tenant-context.ts", import.meta.url),
  "utf8",
);
const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const frontend = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);
const apiSpec = readFileSync(
  new URL("../../../lib/api-spec/openapi.yaml", import.meta.url),
  "utf8",
);
const i18n = readFileSync(
  new URL("../src/lib/i18n.ts", import.meta.url),
  "utf8",
);

test("attendance recording is a separately grantable account permission", () => {
  assert.match(auth, /"attendance\.punch"/);
  assert.match(tenantContext, /\.\.\.explicitPermissions/);
  assert.match(
    route,
    /context\.role === "employee"\s*\|\|\s*!canUseCapability\(context, "attendance\.punch"\)/s,
  );
  assert.match(route, /router\.post\(\s*"\/attendance\/manual-event"/s);
  assert.match(frontend, /useCreateManualAttendanceEvent/);
  assert.match(frontend, /includes\("attendance\.punch"\)/);
  assert.match(frontend, /manualPunchTitle/);
});

test("attendance recording recalculates the stored attendance result", () => {
  const attendanceRoute = route.slice(
    route.indexOf("async function recordCurrentAttendance"),
    route.indexOf('router.post("/attendance/check-in"'),
  );
  assert.match(attendanceRoute, /await attendanceCalculationFor\(context, created, true\)/);
  assert.match(attendanceRoute, /await attendanceCalculationFor\(context, updated, true\)/);
});

test("employees can start the first attendance punch without an existing record", () => {
  assert.match(
    frontend,
    /const canPunch = action === "in" \|\| Boolean\(record\);/,
  );
  assert.match(frontend, /disabled=\{\s*!canPunch\s*\|\|/s);
});

test("company-required GPS punches explain when no attendance geofence is configured", () => {
  const attendanceRoute = route.slice(
    route.indexOf("async function recordCurrentAttendance"),
    route.indexOf('router.post("/attendance/check-in"'),
  );

  assert.equal(
    (attendanceRoute.match(/gpsLocationPolicyUnconfigured/g) ?? []).length,
    2,
  );
  assert.match(i18n, /gpsLocationPolicyUnconfigured:\s*"Attendance was not recorded/);
  assert.match(i18n, /gpsLocationPolicyUnconfigured:\s*"لم يُسجَّل الحضور/);
});

test("employee location punches capture GPS without a fixed geofence and wait for review", () => {
  const attendanceRoute = route.slice(
    route.indexOf("async function recordCurrentAttendance"),
    route.indexOf('router.post("/attendance/check-in"'),
  );

  assert.match(attendanceRoute, /locationRequiredForEmployee && !location/);
  assert.equal(
    (
      attendanceRoute.match(
        /rules\.gpsPolicy === "required"\s*&&\s*!locationRequiredForEmployee\s*&&\s*locationValidation\.status !== "verified"/g,
      ) ?? []
    ).length,
    2,
  );
  assert.match(
    attendanceRoute,
    /rules\.gpsPolicy as string\) === "required"\s*&&\s*!location\s*&&\s*!locationRequiredForEmployee/s,
  );
  assert.match(
    attendanceRoute,
    /locationValidation\.status === "pending"\s*\?\s*message\(req,\s*"gpsLocationCapturedForReview"\)/s,
  );
  assert.match(attendanceRoute, /checkIn: \{ \.\.\.location, capturedAt: eventAt\.toISOString\(\) \}/);
  assert.match(frontend, /تسجيل الحركة بالموقع \(موقع متغير\)/);
  assert.match(frontend, /تسجيل الحركة بالموقع \(موقع ثابت\)/);
  assert.match(frontend, /Attendance movement with location \(variable location\)/);
  assert.match(frontend, /Attendance movement with location \(fixed location\)/);
  assert.equal(
    (frontend.match(/<EmployeeAttendanceLocationMode/g) ?? []).length,
    2,
  );
  assert.match(frontend, /name="employee-attendance-location-mode"/);
  assert.match(frontend, /checked=\{!variableLocation\}/);
  assert.match(frontend, /checked=\{variableLocation\}/);
  assert.match(frontend, /من أي مكان/);
});

test("attendance responses accept payroll-generated absence records, not punch input", () => {
  const eventInput = apiSpec.slice(
    apiSpec.indexOf("    AttendanceEventInput:"),
    apiSpec.indexOf("    AttendanceCorrectionInput:"),
  );
  const attendanceRecord = apiSpec.slice(
    apiSpec.indexOf("    AttendanceRecord:"),
    apiSpec.indexOf("    AttendancePunchRequest:"),
  );

  assert.doesNotMatch(eventInput, /payroll_sync/);
  assert.match(
    attendanceRecord,
    /enum: \[web, mobile, biometric, manual, payroll_sync\]/,
  );
});