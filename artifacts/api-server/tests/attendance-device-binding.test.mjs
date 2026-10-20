import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const schema = readFileSync(
  new URL("../../../lib/db/src/schema/attendance-devices.ts", import.meta.url),
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

test("attendance device registration stores token hashes and only one active device per employee", () => {
  assert.match(schema, /tokenHash: text\("token_hash"\)\.notNull\(\)/);
  assert.match(
    schema,
    /\.where\(sql`\$\{table\.status\} = 'active'`\)/,
  );
  assert.match(route, /createHash\("sha256"\)[\s\S]{0,100}deviceToken/);
  assert.doesNotMatch(route, /deviceToken:\s*parsed\.data\.deviceToken/);
});

test("attendance punches require the approved browser device token", () => {
  const punchRoute = route.slice(
    route.indexOf("async function recordCurrentAttendance"),
    route.indexOf('router.post("/attendance/check-in"'),
  );
  assert.match(punchRoute, /ATTENDANCE_DEVICE_REGISTRATION_REQUIRED/);
  assert.match(punchRoute, /ATTENDANCE_DEVICE_PENDING/);
  assert.match(punchRoute, /device\.status !== "active"/);
  assert.match(punchRoute, /employeeAttendanceDevicesTable\.tokenHash/);
  assert.match(frontend, /deviceToken/);
  assert.match(frontend, /ATTENDANCE_DEVICE_TOKEN_KEY/);
});

test("administrative approval replaces the employee's previous attendance device", () => {
  const decisionRoute = route.slice(
    route.indexOf('router.post(\n  "/employees/:employeeId/attendance-devices/:deviceId/decision"'),
    route.indexOf('router.get(\n  "/employees/:employeeId/work-locations"'),
  );
  assert.match(decisionRoute, /employees\.edit/);
  assert.match(decisionRoute, /status: "revoked"/);
  assert.match(decisionRoute, /status: "active"/);
  assert.match(frontend, /EmployeeAttendanceDevicesPanel/);
  assert.match(frontend, /useDecideEmployeeAttendanceDevice/);
  assert.match(apiSpec, /AttendanceDeviceDecisionInput/);
});
