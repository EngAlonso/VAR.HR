import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const createEmployeeRoute = route.slice(
  route.indexOf('router.post("/employees"'),
  route.indexOf('router.get("/employees/:employeeId"'),
);
const schema = readFileSync(
  new URL("../../../lib/db/src/schema/organization.ts", import.meta.url),
  "utf8",
);
const i18n = readFileSync(
  new URL("../src/lib/i18n.ts", import.meta.url),
  "utf8",
);
const app = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);

test("employee identity indexes are tenant-scoped and nullable-safe", () => {
  assert.match(
    schema,
    /uniqueIndex\(\s*"var_hr_employees_company_national_id_uidx",\s*\)\.on\(table\.companyId, table\.nationalId\)/s,
  );
  assert.match(
    schema,
    /uniqueIndex\(\s*"var_hr_employees_company_phone_uidx",\s*\)\.on\(table\.companyId, table\.phone\)/s,
  );
});

test("employee creation pre-checks national ID and phone within the active tenant", () => {
  assert.match(
    createEmployeeRoute,
    /eq\(employeesTable\.companyId, context\.companyId\)[\s\S]*eq\(employeesTable\.nationalId, parsed\.data\.nationalId\)/,
  );
  assert.match(
    createEmployeeRoute,
    /eq\(employeesTable\.companyId, context\.companyId\)[\s\S]*eq\(employeesTable\.phone, parsed\.data\.phone\)/,
  );
  assert.match(createEmployeeRoute, /EMPLOYEE_NATIONAL_ID_DUPLICATE/);
  assert.match(createEmployeeRoute, /EMPLOYEE_PHONE_DUPLICATE/);
});

test("employee creation maps both database race conflicts to localized 409 responses", () => {
  assert.match(route, /candidate\.code === "23505"/);
  assert.match(
    createEmployeeRoute,
    /constraint === employeeNationalIdUniqueConstraint[\s\S]*res\.status\(409\)/,
  );
  assert.match(
    createEmployeeRoute,
    /constraint === employeePhoneUniqueConstraint[\s\S]*res\.status\(409\)/,
  );
  assert.equal(
    (i18n.match(/employeeNationalIdDuplicate:/g) ?? []).length,
    4,
  );
  assert.equal((i18n.match(/employeePhoneDuplicate:/g) ?? []).length, 4);
});

test("Add Employee surfaces the backend's localized conflict message", () => {
  const addEmployeeRoute = app.slice(
    app.indexOf("function AddEmployeePage()"),
    app.indexOf("function EmployeeListPage()"),
  );
  assert.match(
    addEmployeeRoute,
    /onError: \(error: unknown\) =>\s*toast\.error\(apiErrorMessage\(error, t\("couldNotCreateEmployee"\)\)\)/,
  );
});