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

const addEmployeePage = app.slice(
  app.indexOf("function AddEmployeePage()"),
  app.indexOf("function EmployeeProfilePage()"),
);
const employeeProfilePage = app.slice(
  app.indexOf("function EmployeeProfilePage()"),
  app.indexOf("function Employees()"),
);
const employeesPage = app.slice(
  app.indexOf("function Employees()"),
  app.indexOf("function EmployeeListPage()"),
);
const updateEmployeeRoute = route.slice(
  route.indexOf('router.patch("/employees/:employeeId"'),
  route.indexOf('router.delete("/employees/:employeeId"'),
);
const getEmployeeRoute = route.slice(
  route.indexOf('router.get("/employees/:employeeId"'),
  route.indexOf('router.patch("/employees/:employeeId"'),
);
const getEmployeeScheduleRoute = route.slice(
  route.indexOf('router.get(\n  "/employees/:employeeId/schedule"'),
  route.indexOf('router.put(\n  "/employees/:employeeId/schedule"'),
);
const deleteEmployeeRoute = route.slice(
  route.indexOf('router.delete("/employees/:employeeId"'),
  route.indexOf('router.get("/employees/:employeeId/schedule"'),
);
const deleteDependencies = route.slice(
  route.indexOf("async function employeeDeleteDependencies"),
  route.indexOf("async function departmentResponse"),
);

test("employee creation UI uses the create capability", () => {
  assert.match(addEmployeePage, /employees\.create/);
  assert.doesNotMatch(addEmployeePage, /employees\.manage/);
  assert.match(employeesPage, /employees\.create/);
});

test("employee edit and delete UI use separate capabilities", () => {
  assert.match(employeeProfilePage, /employees\.edit/);
  assert.match(employeeProfilePage, /employees\.manage/);
  assert.match(
    employeeProfilePage,
    /canEditEmployees && \(\s*<Button variant="outline" onClick={openEdit}/s,
  );
  assert.match(
    employeeProfilePage,
    /canDeleteEmployees && \(\s*<Button\s+variant="danger"/s,
  );
});

test("employee numbers remain in numeric order after manual renumbering", () => {
  const employeeListRoute = route.slice(
    route.indexOf('router.get("/employees"'),
    route.indexOf('router.post("/employees"'),
  );
  assert.match(employeeListRoute, /employeeRows\(context\)/);
  assert.match(
    route,
    /orderBy\(\s*sql`CASE WHEN \$\{employeesTable\.employeeNumber\} ~ '\^\[0-9\]\+\$' THEN \$\{employeesTable\.employeeNumber\}::bigint/s,
  );
  assert.match(employeeProfilePage, /getListEmployeesQueryKey\(\)/);
});

test("mobile navigation gestures follow the current language direction", () => {
  const shell = app.slice(
    app.indexOf("function Shell("),
    app.indexOf("function Overview("),
  );
  assert.match(shell, /event\.currentTarget\.setPointerCapture/);
  assert.match(shell, /const swipedTowardClosedEdge = isArabic \? deltaX > 0 : deltaX < 0/);
  assert.match(shell, /isArabic \? deltaX < 0 : deltaX > 0/);
  assert.match(shell, /touchAction: isMobile \? "pan-y" : undefined/);
});

test("department and branch UI use granular management capabilities", () => {
  const departmentsPage = app.slice(
    app.indexOf("function Departments()"),
    app.indexOf("function AddEmployeePage()"),
  );
  const branchesPage = app.slice(
    app.indexOf("function Branches()"),
    app.indexOf("function Departments()"),
  );
  assert.match(departmentsPage, /departments\.manage/);
  assert.doesNotMatch(departmentsPage, /organization\.manage/);
  assert.match(branchesPage, /branches\.manage/);
  assert.doesNotMatch(
    branchesPage,
    /workspace\.data\?\.role === "company_owner"/,
  );
});

test("Manager branch navigation is capability-gated", () => {
  const branchNav = app.slice(
    app.indexOf('href: "/branches"'),
    app.indexOf('href: "/attendance"'),
  );
  assert.match(branchNav, /roles: \["company_owner", "manager"\]/);
  assert.match(branchNav, /capability: "branches\.view"/);
});

test("employee updates enforce the existing manager department scope", () => {
  assert.match(updateEmployeeRoute, /employees\.edit/);
  assert.match(updateEmployeeRoute, /employeeScopeCondition\(context\)/);
  assert.match(updateEmployeeRoute, /context\.role === "manager"/);
  assert.match(updateEmployeeRoute, /parsed\.data\.departmentId !== context\.departmentId/);
  assert.match(updateEmployeeRoute, /workspaceAccessDenied/);
  assert.match(updateEmployeeRoute, /res\.status\(403\)/);
});

test("employee self-service profile is read-only and self-scoped", () => {
  const selfServiceProfile = app.slice(
    app.indexOf("function EmployeeHrProfile("),
    app.indexOf("function AccountProfileSummary("),
  );
  for (const key of [
    "employeeNumber",
    "nationalId",
    "phoneNumber",
    "basicSalary",
    "workingHours",
    "employmentStartDate",
    "department",
    "branch",
    "shift",
    "biometricCode",
  ]) {
    assert.match(selfServiceProfile, new RegExp(`t\\("${key}"\\)`));
  }
  assert.match(selfServiceProfile, /useGetEmployeeSchedule\(employeeId/);
  assert.match(selfServiceProfile, /EmployeeHrPanel employeeId=\{employee\.data\.id\} canEdit=\{false\}/);
  assert.doesNotMatch(selfServiceProfile, /useUpdateEmployee\(/);
  assert.match(getEmployeeRoute, /context\.role === "employee"/);
  assert.match(getEmployeeRoute, /params\.data\.employeeId !== context\.employeeId/);
  assert.match(getEmployeeRoute, /employeeOwnProfile/);
  assert.match(getEmployeeScheduleRoute, /authorizedEmployee\(context, params\.data\.employeeId\)/);
});

test("employee deletes enforce the existing manager department scope", () => {
  assert.match(deleteEmployeeRoute, /employees\.manage/);
  assert.match(deleteEmployeeRoute, /employeeScopeCondition\(context\)/);
  assert.match(deleteEmployeeRoute, /workspaceAccessDenied/);
  assert.match(deleteEmployeeRoute, /res\.status\(403\)/);
});

test("employee deletion blocks HR records that reference the employee as manager", () => {
  assert.match(deleteDependencies, /eq\(employeeHrRecordsTable\.managerId, employeeId\)/);
  assert.match(deleteDependencies, /\["hrManagerRecords", hrManagerRecords\]/);
  assert.match(deleteEmployeeRoute, /dependencies\.length > 0/);
  assert.match(deleteEmployeeRoute, /code: "EMPLOYEE_DELETE_BLOCKED"/);
});