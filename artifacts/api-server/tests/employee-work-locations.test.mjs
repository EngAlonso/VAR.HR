import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const frontend = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);
const schema = readFileSync(
  new URL("../../../lib/db/src/schema/work-locations.ts", import.meta.url),
  "utf8",
);
const apiSpec = readFileSync(
  new URL("../../../lib/api-spec/openapi.yaml", import.meta.url),
  "utf8",
);

const workLocationRoutes = route.slice(
  route.indexOf('router.get(\n  "/employees/:employeeId/work-locations"'),
  route.indexOf('router.patch("/employees/:employeeId"'),
);

test("work-location history is separate from attendance and payroll records", () => {
  assert.match(schema, /var_hr_employee_work_locations/);
  assert.match(workLocationRoutes, /employeeWorkLocationsTable/);
  assert.doesNotMatch(
    workLocationRoutes,
    /attendanceTable|attendanceCalculationFor|payrollCalculationsTable/,
  );
  assert.match(frontend, /This is an informational visit log/);
  assert.match(frontend, /ولا يؤثر على الحضور أو الانصراف أو الرواتب/);
});

test("only an employee's own enabled variable-location profile can add a location", () => {
  assert.match(workLocationRoutes, /context\.employeeId !== params\.data\.employeeId/);
  assert.match(workLocationRoutes, /!employee\.locationAttendanceEnabled/);
  assert.match(workLocationRoutes, /validCoordinates\(parsed\.data\.latitude, parsed\.data\.longitude\)/);
  assert.match(workLocationRoutes, /localCalendarDate\(recordedAt, context\.company\.timezone\)/);
  assert.match(workLocationRoutes, /const comment = parsed\.data\.comment\.trim\(\)/);
});

test("the work-location profile groups visits by day and shows time, map, and comment", () => {
  assert.match(frontend, /<details[\s\S]*?data-testid=\{`work-location-day-\$\{workDate\}`\}/);
  assert.match(frontend, /timeStyle: "short"/);
  assert.match(frontend, /https:\/\/www\.google\.com\/maps\?q=\$\{entry\.latitude\},\$\{entry\.longitude\}/);
  assert.match(frontend, /entry\.comment/);
  assert.match(frontend, /navigator\.geolocation\.getCurrentPosition/);
});

test("work-location endpoints have generated OpenAPI contracts", () => {
  assert.match(apiSpec, /\/employees\/\{employeeId\}\/work-locations:/);
  assert.match(apiSpec, /operationId: listEmployeeWorkLocations/);
  assert.match(apiSpec, /operationId: createEmployeeWorkLocation/);
  assert.match(apiSpec, /EmployeeWorkLocationInput:/);
  assert.match(apiSpec, /EmployeeWorkLocation:/);
});