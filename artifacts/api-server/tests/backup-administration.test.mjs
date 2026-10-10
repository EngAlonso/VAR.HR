import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const platformAdmin = read("../src/routes/platform-admin.ts");
const backupRoutes = read("../src/routes/backups.ts");
const webApp = read("../../var-hr/src/App.tsx");

test("platform backup rows include the associated company's localized name", () => {
  assert.match(
    platformAdmin,
    /backups:\s*\{[\s\S]*?canDelete:\s*false/,
  );
  assert.match(platformAdmin, /nameEn:\s*companiesTable\.nameEn/);
  assert.match(platformAdmin, /company_name_en:/);
  assert.match(
    webApp,
    /data\?\.key === "backups"[\s\S]*?\["company_name", "scope", "status", "created_at"\]/,
  );
  assert.match(webApp, /localizedName\(locale, arabicName, englishName\)/);
});

test("backup rows use the backup-specific audited delete and scoped download routes", () => {
  assert.match(backupRoutes, /router\.get\("\/backups\/:id\/download"/);
  assert.match(backupRoutes, /router\.delete\("\/backups\/:id"/);
  assert.match(backupRoutes, /action: "backup_deleted"/);
  assert.match(webApp, /downloadBackupRow = async/);
  assert.match(webApp, /deleteBackupRow = async/);
  assert.match(webApp, /\/api\/backups\/\$\{encodeURIComponent\(id\)\}\/download/);
  assert.match(webApp, /\/api\/backups\/\$\{encodeURIComponent\(id\)\}/);
  assert.match(webApp, /backupActionCopy\.download/);
  assert.match(webApp, /backupActionCopy\.delete/);
});
