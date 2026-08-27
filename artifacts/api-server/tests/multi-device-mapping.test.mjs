import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(new URL("../src/routes/var-hr.ts", import.meta.url), "utf8");
const createMappingRoute = route.slice(
  route.indexOf('router.post("/devices/:deviceId/mappings"'),
  route.indexOf('router.delete(\n  "/devices/:deviceId/mappings/:mappingId"'),
);
const authRoute = readFileSync(new URL("../src/routes/auth.ts", import.meta.url), "utf8");
const integrationSchema = readFileSync(
  new URL("../../../lib/db/src/schema/integrations.ts", import.meta.url),
  "utf8",
);
const authSchema = readFileSync(
  new URL("../../../lib/db/src/schema/auth.ts", import.meta.url),
  "utf8",
);
const iclockRoute = readFileSync(new URL("../src/routes/iclock.ts", import.meta.url), "utf8");
const backups = readFileSync(new URL("../src/lib/backups.ts", import.meta.url), "utf8");

test("first mapping still creates one account, identity, mapping, and temporary password", () => {
  assert.match(createMappingRoute, /generateNumericPassword\(\)/);
  assert.match(createMappingRoute, /\.insert\(userAccountsTable\)/);
  assert.match(createMappingRoute, /\.insert\(deviceEmployeeMappingsTable\)/);
  assert.match(createMappingRoute, /\.insert\(employeeIdentitiesTable\)/);
  assert.match(createMappingRoute, /temporaryPassword/);
  assert.match(createMappingRoute, /if \(!existingAccount\) \{/);
});

test("additional device mapping reuses the existing account and identity", () => {
  assert.match(
    createMappingRoute,
    /const additionalDeviceMapping = Boolean\(existingIdentity && existingAccount\)/,
  );
  assert.match(createMappingRoute, /const temporaryPassword = additionalDeviceMapping/);
  assert.match(createMappingRoute, /existingIdentity \?\?/);
  assert.doesNotMatch(createMappingRoute, /EMPLOYEE_IDENTITY_EXISTS/);
  assert.doesNotMatch(createMappingRoute, /EMPLOYEE_ACCOUNT_USERNAME_MISMATCH/);
  assert.match(createMappingRoute, /employee_device_mapping_created/);
});

test("account and identity mismatches remain explicit errors", () => {
  assert.match(createMappingRoute, /identityAccountMismatch/);
  assert.match(
    createMappingRoute,
    /EMPLOYEE_IDENTITY_ACCOUNT_MISMATCH/,
  );
  assert.match(createMappingRoute, /existingIdentity\.accountId !== existingAccount\.id/);
  assert.match(createMappingRoute, /existingAccount\.companyId !== context\.companyId/);
  assert.match(createMappingRoute, /existingIdentity\.companyId !== context\.companyId/);
});

test("mapping uniqueness remains device-specific", () => {
  assert.match(
    integrationSchema,
    /uniqueIndex\("var_hr_device_mappings_device_identity_uidx"\)\.on\(table\.deviceId, table\.deviceEmployeeId\)/,
  );
  assert.match(
    createMappingRoute,
    /eq\(deviceEmployeeMappingsTable\.deviceId, device\.id\)/,
  );
  assert.match(
    createMappingRoute,
    /eq\(\s*deviceEmployeeMappingsTable\.deviceEmployeeId,\s*parsed\.data\.deviceEmployeeId/,
  );
  assert.match(createMappingRoute, /deviceMappingDuplicate/);
});

test("employee identity uniqueness remains one identity per employee", () => {
  assert.match(
    authSchema,
    /uniqueIndex\("var_hr_employee_identities_employee_uidx"\)\.on\(table\.employeeId\)/,
  );
  assert.match(
    authSchema,
    /uniqueIndex\("var_hr_employee_identities_device_uidx"\)\.on\(table\.deviceId, table\.biometricEmployeeNumber\)/,
  );
});

test("tenant and capability validation remain on mapping creation", () => {
  assert.match(createMappingRoute, /canUseCapability\(context, "devices\.manage"\)/);
  assert.match(createMappingRoute, /eq\(devicesTable\.companyId, context\.companyId\)/);
  assert.match(createMappingRoute, /eq\(employeesTable\.companyId, context\.companyId\)/);
  assert.match(createMappingRoute, /eq\(employeesTable\.status, "active"\)/);
});

test("employee login remains account-based", () => {
  const loginRoute = authRoute.slice(
    authRoute.indexOf('router.post("/auth/login"'),
    authRoute.indexOf('router.get(\n  "/auth/provision/platform-owner/status"'),
  );
  assert.match(loginRoute, /\.from\(userAccountsTable\)/);
  assert.match(loginRoute, /eq\(userAccountsTable\.username, parsed\.data\.username\)/);
  assert.doesNotMatch(loginRoute, /employeeIdentitiesTable/);
});

test("ADMS continues resolving device plus PIN to employee", () => {
  const cdataRoute = iclockRoute.slice(iclockRoute.indexOf('router.post("/cdata"'));
  assert.match(cdataRoute, /eq\(deviceEmployeeMappingsTable\.companyId, device\.companyId\)/);
  assert.match(cdataRoute, /eq\(deviceEmployeeMappingsTable\.deviceId, device\.id\)/);
  assert.match(cdataRoute, /eq\(deviceEmployeeMappingsTable\.deviceEmployeeId, pin\)/);
  assert.match(cdataRoute, /mapping\.employeeId/);
  assert.match(cdataRoute, /applyProviderAttendanceEvent/);
});

test("ADMS idempotency behavior remains unchanged", () => {
  assert.match(
    iclockRoute,
    /onConflictDoNothing\(\{ target: \[biometricEventsTable\.companyId, biometricEventsTable\.idempotencyKey\] \}\)/,
  );
  assert.match(iclockRoute, /if \(!event\) \{ duplicates\+\+; continue; \}/);
});

test("backup and restore continue carrying both biometric tables", () => {
  assert.match(backups, /"var_hr_device_employee_mappings"/g);
  assert.match(backups, /"var_hr_employee_identities"/g);
  assert.ok(
    backups.indexOf('"var_hr_device_employee_mappings"') <
      backups.indexOf('"var_hr_employee_identities"'),
  );
});