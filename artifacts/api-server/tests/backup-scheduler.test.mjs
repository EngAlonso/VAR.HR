import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

const settingsRoute = read("../src/routes/platform-admin.ts");
const backupRoute = read("../src/routes/backups.ts");
const backupLibrary = read("../src/lib/backups.ts");
const scheduler = read("../src/lib/backup-scheduler.ts");
const googleDriveRoute = read("../src/routes/google-drive.ts");
const googleDriveBackups = read("../src/lib/google-drive-backups.ts");
const googleDriveAuth = read("../src/lib/google-drive-auth.ts");
const apiSpec = read("../../../lib/api-spec/openapi.yaml");
const apiIndex = read("../src/index.ts");
const webApp = read("../../var-hr/src/App.tsx");
const vercelConfig = read("../../../vercel.json");

test("backup schedule settings are restricted to platform owners", () => {
  assert.match(
    settingsRoute,
    /router\.get\("\/platform\/backup-schedule"[\s\S]*?await requirePlatformOwner\(req\)/,
  );
  assert.match(
    settingsRoute,
    /router\.patch\("\/platform\/backup-schedule"[\s\S]*?await requirePlatformOwner\(req\)/,
  );
  assert.match(settingsRoute, /z\.literal\(1440\)/);
  assert.match(settingsRoute, /z\.literal\(10080\)/);
  assert.match(webApp, /isPlatformOwner && \([\s\S]*?data-testid="save-backup-schedule"/);
});

test("automatic backups use their own marker and a shared scheduler lock", () => {
  assert.match(scheduler, /pg_try_advisory_lock/);
  assert.match(scheduler, /creationMode: "scheduled"/);
  assert.match(scheduler, /scope: "platform"/);
  assert.match(scheduler, /scope: "company"/);
  assert.match(backupLibrary, /input\.creationMode \? \{ creationMode: input\.creationMode \}/);
  assert.match(backupLibrary, /scheduleIntervalMinutes/);
});

test("persistent servers and Vercel have authenticated scheduler triggers", () => {
  assert.match(apiIndex, /startAutomaticBackupScheduler\(\)/);
  assert.match(backupRoute, /process\.env\.CRON_SECRET/);
  assert.match(backupRoute, /timingSafeEqual/);
  assert.match(vercelConfig, /"path": "\/api\/internal\/backup-scheduler"/);
  assert.match(vercelConfig, /"schedule": "0 2 \* \* \*"/);
});

test("opening backup settings automatically retries connected Drive backlog", () => {
  assert.match(webApp, /driveAutoRetryStarted = useRef\(false\)/);
  assert.match(
    webApp,
    /!driveStatus\?\.connected[\s\S]*?driveStatus\.pendingBackups <= 0[\s\S]*?driveAutoRetryStarted\.current/,
  );
  assert.match(webApp, /driveAutoRetryStarted\.current = true;[\s\S]*?void retryGoogleDrive\(false\)/);
  assert.match(googleDriveRoute, /const force = retryRequest\.data\.force \?\? true/);
});

test("Drive retry results expose sanitized failure codes to the backup UI", () => {
  assert.match(googleDriveBackups, /errorCodes: \["GOOGLE_OAUTH_NOT_CONFIGURED"\]/);
  assert.match(googleDriveBackups, /errorCodes\.add\(result\.errorCode\)/);
  assert.match(googleDriveAuth, /typeof error\.code === "string"[\s\S]*?return error\.code/);
  assert.match(apiSpec, /GoogleDriveRetryResult:[\s\S]*?errorCodes:/);
  assert.match(webApp, /result\.failed[\s\S]*?result\.errorCodes\.join\(", "\)/);
  assert.match(webApp, /driveRetryNotDue/);
});

test("older platform backups default new schedule settings during restore", () => {
  assert.match(
    backupLibrary,
    /platform_backup_interval_minutes:\s*row\.platform_backup_interval_minutes\s*\?\?\s*0/,
  );
  assert.match(
    backupLibrary,
    /company_backup_interval_minutes:\s*row\.company_backup_interval_minutes\s*\?\?\s*0/,
  );
});