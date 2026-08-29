import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const updateEmployeeRoute = route.slice(
  route.indexOf('router.patch("/employees/:employeeId"'),
  route.indexOf('router.delete("/employees/:employeeId"'),
);
const employeeNumberUpdate = updateEmployeeRoute.slice(
  updateEmployeeRoute.indexOf("if (updateData.employeeNumber !== undefined)"),
  updateEmployeeRoute.indexOf("let employee:"),
);
const phoneSync = updateEmployeeRoute.slice(
  updateEmployeeRoute.indexOf("const phoneChanged"),
  updateEmployeeRoute.indexOf("} catch (error)"),
);

test("changing an employee number does not change the login username", () => {
  assert.doesNotMatch(employeeNumberUpdate, /userAccountsTable/);
  assert.match(phoneSync, /updateData\.phone !== undefined/);
  assert.match(phoneSync, /updateData\.phone !== before\.phone/);
});

test("changing an employee phone updates the existing linked account username", () => {
  assert.match(
    phoneSync,
    /eq\(userAccountsTable\.employeeId, before\.id\)/,
  );
  assert.match(
    phoneSync,
    /eq\(userAccountsTable\.companyId, context\.companyId\)/,
  );
  assert.match(
    phoneSync,
    /\.set\(\{\s*username: updateData\.phone,\s*primaryPhone: updateData\.phone,\s*updatedAt: new Date\(\),\s*\}\)/s,
  );
  assert.match(phoneSync, /eq\(userAccountsTable\.id, linkedEmployeeAccountId\)/);
  assert.match(phoneSync, /EMPLOYEE_PHONE_USERNAME_DUPLICATE/);
  assert.doesNotMatch(phoneSync, /passwordHash/);
});