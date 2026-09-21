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