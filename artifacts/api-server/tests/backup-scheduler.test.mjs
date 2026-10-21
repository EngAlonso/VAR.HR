import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isBackupDue } from "../src/lib/backup-schedule-time.mjs";

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
  assert.match(settingsRoute, /z\.literal\(360\)/);
  assert.match(settingsRoute, /platformScheduleEnabled \? 360 : 0/);
  assert.match(
    scheduler,
    /\(settings\?\.platformIntervalMinutes \?\? 0\) > 0 \? 360 : 0/,
  );
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

test("daily backups run once per Cairo day at or after 13:00 local time", () => {
  const daily = 1440;
  const beforeRun = new Date("2026-07-12T09:59:00.000Z"); // 12:59 in Cairo
  const atRun = new Date("2026-07-12T10:00:00.000Z"); // 13:00 in Cairo
  const earlierToday = new Date("2026-07-12T08:00:00.000Z"); // 11:00 in Cairo
  const alreadyRunToday = new Date("2026-07-12T10:00:00.000Z");
  const previousDayLate = new Date("2026-07-11T20:30:00.000Z"); // 23:30 yesterday

  assert.equal(isBackupDue(daily, undefined, beforeRun), false);
  assert.equal(isBackupDue(daily, undefined, atRun), true);
  assert.equal(isBackupDue(daily, earlierToday, atRun), true);
  assert.equal(isBackupDue(daily, alreadyRunToday, atRun), false);
  assert.equal(isBackupDue(daily, previousDayLate, atRun), true);
});

test("platform backups follow fixed six-hour Cairo slots", () => {
  const sixHours = 360;
  const beforeFirstSummerSlot = new Date("2026-07-11T21:59:00.000Z"); // 00:59 Cairo
  const firstSummerSlot = new Date("2026-07-11T22:00:00.000Z"); // 01:00 Cairo
  const firstBackup = new Date("2026-07-11T22:02:00.000Z");
  const sevenAm = new Date("2026-07-12T04:00:00.000Z");
  const onePm = new Date("2026-07-12T10:00:00.000Z");
  const sevenPm = new Date("2026-07-12T16:00:00.000Z");
  const afterOnePmBackup = new Date("2026-07-12T10:02:00.000Z");

  assert.equal(isBackupDue(sixHours, undefined, beforeFirstSummerSlot), false);
  assert.equal(isBackupDue(sixHours, undefined, firstSummerSlot), true);
  assert.equal(isBackupDue(sixHours, firstBackup, firstSummerSlot), false);
  assert.equal(isBackupDue(sixHours, firstBackup, sevenAm), true);
  assert.equal(isBackupDue(sixHours, new Date("2026-07-12T04:02:00.000Z"), onePm), true);
  assert.equal(isBackupDue(sixHours, afterOnePmBackup, sevenPm), true);
  assert.equal(
    isBackupDue(
      sixHours,
      new Date("2026-07-12T16:02:00.000Z"),
      new Date("2026-07-12T22:00:00.000Z"),
    ),
    true,
  );

  const firstWinterSlot = new Date("2026-01-11T23:00:00.000Z"); // 01:00 Cairo
  assert.equal(isBackupDue(sixHours, undefined, firstWinterSlot), true);
});

test("weekly backups retain their elapsed-interval behavior", () => {
  const now = new Date("2026-07-12T02:00:00.000Z");
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60_000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60_000);

  assert.equal(isBackupDue(10080, sixDaysAgo, now), false);
  assert.equal(isBackupDue(10080, sevenDaysAgo, now), true);
});

test("persistent servers and Vercel have authenticated scheduler triggers", () => {
  assert.match(apiIndex, /startAutomaticBackupScheduler\(\)/);
  assert.match(backupRoute, /process\.env\.CRON_SECRET/);
  assert.match(backupRoute, /timingSafeEqual/);
  assert.match(
    backupRoute,
    /runAutomaticBackupScheduler\(\{\s*source: "vercel-cron",\s*recordIdleRuns: true/,
  );
  assert.match(vercelConfig, /"path": "\/api\/internal\/backup-scheduler"/);
});

test("scheduler persists no-op runs and the latest platform/company attempts", () => {
  assert.match(scheduler, /targetKey: "latest-run"/);
  assert.match(scheduler, /targetKey: "platform"/);
  assert.match(scheduler, /targetKey: `company:\$\{company\.id\}`/);
  assert.match(scheduler, /attemptedTargets === 0[\s\S]*?"no_due_backups"/);
  assert.match(
    scheduler,
    /if \(recordIdleRuns\) \{\s*await saveRunStatus\("skipped", "already_running"\)/,
  );
  assert.match(
    settingsRoute,
    /schedulerStatus:\s*\{\s*latestRun:[\s\S]*?targets:/,
  );
  assert.match(webApp, /labels\.schedulerStatusTitle/);
  assert.match(webApp, /backup-scheduler-target-/);
  assert.match(apiSpec, /\/platform\/backup-schedule:[\s\S]*?PlatformBackupSchedule/);
});

test("only scheduled platform backups can be uploaded or retried through Google Drive", () => {
  assert.match(
    googleDriveBackups,
    /record\.scope !== "platform" \|\| record\.companyId !== null/,
  );
  assert.equal(
    [...googleDriveBackups.matchAll(/eq\(backupRecordsTable\.scope, "platform"\)/g)]
      .length,
    2,
  );
  assert.match(
    scheduler,
    /scope: "platform"[\s\S]*?uploadCreatedBackup\(\s*record,\s*"Platform backup",?\s*\)/,
  );
  assert.match(
    webApp,
    /backup\.scope === "platform" &&\s*backup\.metadata\.creationMode === "scheduled"/,
  );
});

test("Vercel cron checks cover all four Cairo slots in both standard and daylight time", () => {
  const schedules = [
    ...vercelConfig.matchAll(/"schedule":\s*"([^"]+)"/g),
  ].map((match) => match[1]);
  assert.deepEqual(schedules, [
    "0 22 * * *",
    "0 23 * * *",
    "0 4 * * *",
    "0 5 * * *",
    "0 10 * * *",
    "0 11 * * *",
    "0 16 * * *",
    "0 17 * * *",
  ]);

  assert.equal(
    isBackupDue(360, new Date("2026-07-12T04:02:00.000Z"), new Date("2026-07-12T10:00:00.000Z")),
    true,
  );
  assert.equal(
    isBackupDue(360, new Date("2026-01-12T05:02:00.000Z"), new Date("2026-01-12T11:00:00.000Z")),
    true,
  );
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
  assert.match(googleDriveBackups, /firstDetail\.reason[\s\S]*?error\.status/);
  assert.match(googleDriveBackups, /new GoogleDriveApiError\(response\.status, operation, reason\)/);
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