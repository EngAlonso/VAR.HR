import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const backups = readFileSync(
  new URL("../src/lib/backups.ts", import.meta.url),
  "utf8",
);
const schemaDirectory = new URL("../../../lib/db/src/schema/", import.meta.url);
const schemaSources = readdirSync(schemaDirectory)
  .filter((file) => file.endsWith(".ts"))
  .map((file) =>
    readFileSync(new URL(file, schemaDirectory), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, ""),
  )
  .join("\n");

const tableOrderMatch = backups.match(
  /const insertOrder = \[([\s\S]*?)\] as const;/,
);
const tableOrder = [
  ...(tableOrderMatch?.[1].matchAll(/"(var_hr_[^"]+)"/g) ?? []),
].map((match) => match[1]);
const schemaTables = new Set(
  [...schemaSources.matchAll(/pgTable\(\s*"([^"]+)"/g)].map(
    (match) => match[1],
  ),
);

function readSet(name) {
  const match = backups.match(
    new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\);`),
  );
  assert.ok(match, `Could not find ${name} in backups.ts`);
  return new Set([...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
}

test("every persisted database table is backed up or explicitly excluded", () => {
  assert.ok(tableOrderMatch, "Backup insert order must be declared.");
  assert.equal(new Set(tableOrder).size, tableOrder.length, "Backup table order must not contain duplicates.");

  const intentionallyExcluded = new Set([
    "var_hr_auth_sessions",
    "var_hr_backup_records",
    "var_hr_google_drive_connection",
  ]);
  const includedTables = new Set(tableOrder);
  assert.deepEqual(
    [...includedTables].sort(),
    [...schemaTables]
      .filter((table) => !intentionallyExcluded.has(table))
      .sort(),
    "Update the backup table order or the explicit exclusions when database tables change.",
  );
});

test("tenant-owned additions are scoped and legacy backups may omit new tables", () => {
  const companyScopedTables = readSet("companyScopedTables");
  const optionalLegacyTables = readSet("optionalTablesForLegacyBackups");
  const newlyCoveredCompanyTables = [
    "var_hr_employee_schedule_assignments",
    "var_hr_attendance_punch_requests",
    "var_hr_attendance_calculations",
    "var_hr_attendance_time_adjustments",
    "var_hr_leave_balance_transactions",
    "var_hr_biometric_device_commands",
    "var_hr_notifications",
    "var_hr_notification_subscriptions",
    "var_hr_attendance_rule_changes",
    "var_hr_leave_policies",
  ];

  for (const table of newlyCoveredCompanyTables) {
    assert.ok(companyScopedTables.has(table), `${table} must be company-scoped.`);
    assert.ok(optionalLegacyTables.has(table), `${table} must be optional in older backups.`);
  }
  assert.ok(optionalLegacyTables.has("var_hr_platform_settings"));
  assert.ok(tableOrder.includes("var_hr_account_permissions"));
  assert.ok(!optionalLegacyTables.has("var_hr_account_permissions"));
  assert.ok(readSet("platformOnlyTables").has("var_hr_platform_settings"));
  assert.match(
    backups,
    /for \(const column of \[\s*"account_id",\s*"user_id",\s*"actor_id",\s*"created_by",\s*"requested_by",\s*"decided_by",\s*"approved_by",\s*"rejected_by",\s*"reversed_by"/,
    "Platform restores must remap account foreign keys across the new tables.",
  );
  assert.match(
    backups,
    /rows === undefined && optionalTablesForLegacyBackups\.has\(table\)/,
    "Validation must accept legacy backups that lack newly included tables.",
  );
  assert.match(backups, /async function synchronizeBiometricCommandSequence/);
  assert.match(backups, /await synchronizeBiometricCommandSequence\(client\)/);
});

test("restore preserves audit events when their optional actor account is missing", () => {
  assert.match(
    backups,
    /if \(table === "var_hr_auth_audit_events"\) \{[\s\S]*SELECT id::text AS id FROM "\$\{companyUserTable\}"[\s\S]*knownAccountIds = new Set/,
  );
  assert.match(
    backups,
    /table === "var_hr_auth_audit_events"[\s\S]*typeof restoreRow\.account_id === "string"[\s\S]*!knownAccountIds\?\.has\(restoreRow\.account_id\)[\s\S]*restoreRow\.account_id = null/,
  );
});