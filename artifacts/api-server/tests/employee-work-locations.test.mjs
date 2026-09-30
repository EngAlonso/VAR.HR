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

test("employee profile keeps work locations beside the movement record button", () => {
  const movementButton = frontend.indexOf(
    "data-testid={`button-open-attendance-movement-",
  );
  const workLocationsButton = frontend.indexOf(
    "data-testid={`button-open-work-locations-",
  );
  const groupedActions = frontend.lastIndexOf(
    '<div className="flex items-center gap-2">',
    movementButton,
  );
  const groupEnd = frontend.indexOf("</div>", workLocationsButton);

  assert.ok(movementButton >= 0 && workLocationsButton > movementButton);
  assert.ok(groupedActions >= 0 && groupEnd > workLocationsButton);
  assert.match(
    frontend.slice(groupedActions, groupEnd),
    /locationAttendanceEnabled/,
  );
});

test("eligible employees record a work-location change from the attendance section", () => {
  const attendanceStart = frontend.indexOf("function Attendance()");
  const attendanceEnd = frontend.indexOf("\nfunction ", attendanceStart + 1);
  const attendance = frontend.slice(attendanceStart, attendanceEnd);

  assert.match(
    attendance,
    /workspace\.data\?\.role === "employee" &&\s*selfEmployee\.data\?\.locationAttendanceEnabled/,
  );
  assert.match(
    attendance,
    /<WorkLocationChangeButton employeeId=\{selfEmployee\.data\.id\}/,
  );
  assert.equal((frontend.match(/<WorkLocationChangeButton /g) ?? []).length, 1);
});

test("work-location endpoints have generated OpenAPI contracts", () => {
  assert.match(apiSpec, /\/employees\/\{employeeId\}\/work-locations:/);
  assert.match(apiSpec, /operationId: listEmployeeWorkLocations/);
  assert.match(apiSpec, /operationId: createEmployeeWorkLocation/);
  assert.match(apiSpec, /EmployeeWorkLocationInput:/);
  assert.match(apiSpec, /EmployeeWorkLocation:/);
});