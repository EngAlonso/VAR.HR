// @ts-nocheck
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";
import {
  backupRecordsTable,
  backupSchedulerStatusTable,
  companiesTable,
  db,
  platformSettingsTable,
  pool,
  userAccountsTable,
} from "@workspace/db";
import { createBackup } from "./backups";
import { isBackupDue as isDue } from "./backup-schedule-time.mjs";
import { logger } from "./logger";
import {
  retryPendingGoogleDriveBackups,
  uploadScheduledBackupToGoogleDrive,
} from "./google-drive-backups";

const schedulerIntervalMs = 60_000;
const advisoryLockSql = "SELECT pg_try_advisory_lock(15480, 23001) AS acquired";
const advisoryUnlockSql = "SELECT pg_advisory_unlock(15480, 23001)";

let schedulerTimer: ReturnType<typeof setInterval> | undefined;

async function lastPlatformScheduledBackup(): Promise<Date | undefined> {
  const [record] = await db
    .select({ createdAt: backupRecordsTable.createdAt })
    .from(backupRecordsTable)
    .where(
      and(
        eq(backupRecordsTable.scope, "platform"),
        isNull(backupRecordsTable.companyId),
        sql`${backupRecordsTable.metadata} ->> 'creationMode' = 'scheduled'`,
      ),
    )
    .orderBy(desc(backupRecordsTable.createdAt))
    .limit(1);
  return record?.createdAt;
}

function storedBackupSchedulerError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  return message
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/gi, "$1[redacted]@")
    .split("\n")[0]
    .slice(0, 500);
}

async function saveBackupSchedulerStatus(values: Record<string, unknown>) {
  await db
    .insert(backupSchedulerStatusTable)
    .values(values)
    .onConflictDoUpdate({
      target: backupSchedulerStatusTable.targetKey,
      set: { ...values, updatedAt: new Date() },
    });
}

export async function runAutomaticBackupScheduler(options = {}) {
  const source = options.source ?? "server-poller";
  const recordIdleRuns = options.recordIdleRuns === true;
  const runId = randomUUID();
  const startedAt = new Date();
  let lockClient;
  let acquired = false;
  let destroyLockConnection = false;
  let runStatusSaved = false;
  let platformCreated = 0;
  let companyCreated = 0;
  let failures = 0;
  let driveUploaded = 0;
  let driveFailed = 0;
  let drivePending = 0;
  let attemptedTargets = 0;
  const runErrors: string[] = [];

  const saveRunStatus = async (status: string, reason: string | null) => {
    await saveBackupSchedulerStatus({
      targetKey: "latest-run",
      runId,
      targetType: "run",
      companyId: null,
      companyName: null,
      companyNameEn: null,
      source,
      status,
      reason,
      startedAt,
      completedAt: status === "running" ? null : new Date(),
      backupsCreated: platformCreated + companyCreated,
      platformCreated,
      companyCreated,
      failureCount: failures,
      driveUploaded,
      driveFailed,
      drivePending,
      errorMessage: runErrors.length
        ? runErrors.join("; ").slice(0, 1000)
        : null,
    });
    runStatusSaved = true;
  };

  const ensureRunStatus = async () => {
    if (!runStatusSaved) await saveRunStatus("running", "in_progress");
  };

  const startTargetAttempt = async (target: {
    targetKey: string;
    targetType: "platform" | "company";
    companyId: string | null;
    companyName: string | null;
    companyNameEn: string | null;
  }) => {
    await ensureRunStatus();
    attemptedTargets += 1;
    const targetStartedAt = new Date();
    await saveBackupSchedulerStatus({
      targetKey: target.targetKey,
      runId,
      targetType: target.targetType,
      companyId: target.companyId,
      companyName: target.companyName,
      companyNameEn: target.companyNameEn,
      source,
      status: "running",
      reason: "backup_attempt",
      startedAt: targetStartedAt,
      completedAt: null,
      backupsCreated: 0,
      platformCreated: 0,
      companyCreated: 0,
      failureCount: 0,
      driveUploaded: 0,
      driveFailed: 0,
      drivePending: 0,
      errorMessage: null,
    });
    return targetStartedAt;
  };

  const finishTargetAttempt = async (
    target: {
      targetKey: string;
      targetType: "platform" | "company";
      companyId: string | null;
      companyName: string | null;
      companyNameEn: string | null;
    },
    targetStartedAt: Date,
    result: {
      status: string;
      backupsCreated: number;
      failureCount?: number;
      driveUploaded?: number;
      driveFailed?: number;
      errorMessage?: string | null;
    },
  ) => {
    await saveBackupSchedulerStatus({
      targetKey: target.targetKey,
      runId,
      targetType: target.targetType,
      companyId: target.companyId,
      companyName: target.companyName,
      companyNameEn: target.companyNameEn,
      source,
      status: result.status,
      reason: null,
      startedAt: targetStartedAt,
      completedAt: new Date(),
      backupsCreated: result.backupsCreated,
      platformCreated: 0,
      companyCreated: 0,
      failureCount: result.failureCount ?? 0,
      driveUploaded: result.driveUploaded ?? 0,
      driveFailed: result.driveFailed ?? 0,
      drivePending: 0,
      errorMessage: result.errorMessage ?? null,
    });
    await saveRunStatus("running", "in_progress");
  };

  const uploadCreatedBackup = async (record: unknown, targetLabel: string) => {
    try {
      const result = await uploadScheduledBackupToGoogleDrive(record);
      if (result.uploaded) driveUploaded += 1;
      if (result.errorCode) {
        driveFailed += 1;
        runErrors.push(
          `${targetLabel}: Google Drive upload failed (${result.errorCode})`,
        );
      }
      return {
        driveUploaded: result.uploaded ? 1 : 0,
        driveFailed: result.errorCode ? 1 : 0,
        errorMessage: result.errorCode
          ? `Google Drive upload failed (${result.errorCode})`
          : null,
      };
    } catch (error) {
      driveFailed += 1;
      const message = storedBackupSchedulerError(error);
      logger.error({ err: error, targetLabel }, "Scheduled Drive upload failed");
      runErrors.push(`${targetLabel}: Google Drive upload failed: ${message}`);
      return {
        driveUploaded: 0,
        driveFailed: 1,
        errorMessage: `Google Drive upload failed: ${message}`,
      };
    }
  };

  try {
    lockClient = await pool.connect();
    const lockResult = await lockClient.query(advisoryLockSql);
    acquired = Boolean(lockResult.rows[0]?.acquired);
    if (!acquired) {
      if (recordIdleRuns) {
        await saveRunStatus("skipped", "already_running");
      }
      return {
        started: false,
        reason: "already_running",
        platformCreated,
        companyCreated,
        failures,
        driveUploaded,
        driveFailed,
        drivePending,
      };
    }

    if (recordIdleRuns) await saveRunStatus("running", "running");

    try {
      const retryResult = await retryPendingGoogleDriveBackups();
      driveUploaded += retryResult.uploaded;
      driveFailed += retryResult.failed;
      drivePending = retryResult.pending;
    } catch (err) {
      driveFailed += 1;
      runErrors.push(
        `Could not retry pending Google Drive backups: ${storedBackupSchedulerError(err)}`,
      );
      logger.error({ err }, "Could not retry pending Google Drive backups");
    }

    const [settings] = await db
      .select({
        platformIntervalMinutes:
          platformSettingsTable.platformBackupIntervalMinutes,
        companyIntervalMinutes:
          platformSettingsTable.companyBackupIntervalMinutes,
      })
      .from(platformSettingsTable)
      .where(eq(platformSettingsTable.id, "default"))
      .limit(1);

    const platformIntervalMinutes = settings?.platformIntervalMinutes ?? 0;
    const companyIntervalMinutes = settings?.companyIntervalMinutes ?? 0;
    if (platformIntervalMinutes <= 0 && companyIntervalMinutes <= 0) {
      const result = {
        started: true,
        reason: "disabled",
        platformCreated,
        companyCreated,
        failures,
        driveUploaded,
        driveFailed,
        drivePending,
      };
      if (recordIdleRuns || driveUploaded > 0 || driveFailed > 0) {
        await saveRunStatus(
          driveFailed > 0 ? "completed_with_errors" : "skipped",
          "disabled",
        );
      }
      return result;
    }

    const [owner] = await db
      .select({ id: userAccountsTable.id })
      .from(userAccountsTable)
      .where(
        and(
          eq(userAccountsTable.accountType, "platform_owner"),
          eq(userAccountsTable.active, true),
          isNull(userAccountsTable.companyId),
        ),
      )
      .orderBy(asc(userAccountsTable.id))
      .limit(1);

    if (!owner) {
      logger.warn(
        "Automatic backups are enabled, but no active platform owner account is available",
      );
      failures += 1;
      runErrors.push("No active platform owner account is available.");
      await saveRunStatus("failed", "no_active_platform_owner");
      return {
        started: false,
        reason: "no_active_platform_owner",
        platformCreated,
        companyCreated,
        failures,
        driveUploaded,
        driveFailed,
        drivePending,
      };
    }

    const now = new Date();

    if (platformIntervalMinutes > 0) {
      const target = {
        targetKey: "platform",
        targetType: "platform" as const,
        companyId: null,
        companyName: null,
        companyNameEn: null,
      };
      let due = false;
      try {
        const lastCreatedAt = await lastPlatformScheduledBackup();
        due = isDue(platformIntervalMinutes, lastCreatedAt, now);
      } catch (err) {
        failures += 1;
        const message = storedBackupSchedulerError(err);
        runErrors.push(`Platform backup schedule check failed: ${message}`);
        const targetStartedAt = await startTargetAttempt(target);
        await finishTargetAttempt(target, targetStartedAt, {
          status: "failed",
          backupsCreated: 0,
          failureCount: 1,
          errorMessage: message,
        });
        logger.error({ err }, "Could not check platform backup schedule");
      }
      if (due) {
        const targetStartedAt = await startTargetAttempt(target);
        try {
          const record = await createBackup({
            scope: "platform",
            companyId: null,
            createdBy: owner.id,
            creationMode: "scheduled",
            scheduleIntervalMinutes: platformIntervalMinutes,
          });
          platformCreated += 1;
          const driveResult = await uploadCreatedBackup(
            record,
            "Platform backup",
          );
          await finishTargetAttempt(target, targetStartedAt, {
            status:
              driveResult.driveFailed > 0
                ? "created_with_errors"
                : "created",
            backupsCreated: 1,
            driveUploaded: driveResult.driveUploaded,
            driveFailed: driveResult.driveFailed,
            errorMessage: driveResult.errorMessage,
          });
          logger.info(
            { intervalMinutes: platformIntervalMinutes },
            "Scheduled platform backup created",
          );
        } catch (err) {
          failures += 1;
          const message = storedBackupSchedulerError(err);
          runErrors.push(`Platform backup failed: ${message}`);
          await finishTargetAttempt(target, targetStartedAt, {
            status: "failed",
            backupsCreated: 0,
            failureCount: 1,
            errorMessage: message,
          });
          logger.error({ err }, "Scheduled platform backup failed");
        }
      }
    }

    if (companyIntervalMinutes > 0) {
      try {
        const companies = await db
          .select({
            id: companiesTable.id,
            name: companiesTable.name,
            nameEn: companiesTable.nameEn,
          })
          .from(companiesTable)
          .orderBy(asc(companiesTable.id));
        const oldestRelevantBackup = new Date(
          now.getTime() - companyIntervalMinutes * 60_000,
        );
        const recentScheduledRows = await db
          .select({
            companyId: backupRecordsTable.companyId,
            createdAt: backupRecordsTable.createdAt,
          })
          .from(backupRecordsTable)
          .where(
            and(
              eq(backupRecordsTable.scope, "company"),
              isNotNull(backupRecordsTable.companyId),
              gte(backupRecordsTable.createdAt, oldestRelevantBackup),
              sql`${backupRecordsTable.metadata} ->> 'creationMode' = 'scheduled'`,
            ),
          )
          .orderBy(desc(backupRecordsTable.createdAt));
        const latestByCompany = new Map<string, Date>();
        for (const record of recentScheduledRows) {
          if (record.companyId && !latestByCompany.has(record.companyId)) {
            latestByCompany.set(record.companyId, record.createdAt);
          }
        }

        for (const company of companies) {
          let due = false;
          try {
            due = isDue(
              companyIntervalMinutes,
              latestByCompany.get(company.id),
              now,
            );
          } catch (err) {
            failures += 1;
            const message = storedBackupSchedulerError(err);
            runErrors.push(
              `Backup schedule check failed for ${company.name}: ${message}`,
            );
            const target = {
              targetKey: `company:${company.id}`,
              targetType: "company" as const,
              companyId: company.id,
              companyName: company.name,
              companyNameEn: company.nameEn,
            };
            const targetStartedAt = await startTargetAttempt(target);
            await finishTargetAttempt(target, targetStartedAt, {
              status: "failed",
              backupsCreated: 0,
              failureCount: 1,
              errorMessage: message,
            });
            logger.error({ err, companyId: company.id }, "Could not check company backup schedule");
          }
          if (!due) continue;
          const target = {
            targetKey: `company:${company.id}`,
            targetType: "company" as const,
            companyId: company.id,
            companyName: company.name,
            companyNameEn: company.nameEn,
          };
          const targetStartedAt = await startTargetAttempt(target);
          try {
            await createBackup({
              scope: "company",
              companyId: company.id,
              createdBy: owner.id,
              creationMode: "scheduled",
              scheduleIntervalMinutes: companyIntervalMinutes,
            });
            companyCreated += 1;
            await finishTargetAttempt(target, targetStartedAt, {
              status: "created",
              backupsCreated: 1,
            });
            logger.info(
              { companyId: company.id, intervalMinutes: companyIntervalMinutes },
              "Scheduled company backup created",
            );
          } catch (err) {
            failures += 1;
            const message = storedBackupSchedulerError(err);
            runErrors.push(`Company backup failed for ${company.name}: ${message}`);
            await finishTargetAttempt(target, targetStartedAt, {
              status: "failed",
              backupsCreated: 0,
              failureCount: 1,
              errorMessage: message,
            });
            logger.error(
              { err, companyId: company.id },
              "Scheduled company backup failed",
            );
          }
        }
      } catch (err) {
        failures += 1;
        const message = storedBackupSchedulerError(err);
        runErrors.push(`Could not enumerate companies for scheduled backups: ${message}`);
        logger.error({ err }, "Could not enumerate companies for scheduled backups");
      }
    }

    const result = {
      started: true,
      reason:
        failures > 0
          ? "backup_failures"
          : attemptedTargets === 0
            ? "no_due_backups"
            : "completed",
      platformCreated,
      companyCreated,
      failures,
      driveUploaded,
      driveFailed,
      drivePending,
    };
    if (
      recordIdleRuns ||
      attemptedTargets > 0 ||
      failures > 0 ||
      driveUploaded > 0 ||
      driveFailed > 0
    ) {
      const status =
        failures > 0
          ? "failed"
          : driveFailed > 0
            ? "completed_with_errors"
            : "completed";
      await saveRunStatus(status, result.reason);
    }
    return result;
  } catch (err) {
    const message = storedBackupSchedulerError(err);
    failures += 1;
    runErrors.push(message);
    try {
      await saveRunStatus("failed", "scheduler_error");
    } catch (statusError) {
      logger.error(
        { err: statusError },
        "Could not persist automatic backup scheduler failure status",
      );
    }
    throw err;
  } finally {
    if (acquired && lockClient) {
      try {
        await lockClient.query(advisoryUnlockSql);
      } catch (err) {
        destroyLockConnection = true;
        logger.error({ err }, "Could not release automatic backup scheduler lock");
      }
    }
    lockClient?.release(destroyLockConnection);
  }
}

export function startAutomaticBackupScheduler(): void {
  if (schedulerTimer) return;
  logger.info("Starting automatic backup scheduler");
  schedulerTimer = setInterval(() => {
    void runAutomaticBackupScheduler().catch((err) => {
      logger.error({ err }, "Automatic backup scheduler tick failed");
    });
  }, schedulerIntervalMs);
  schedulerTimer.unref();
  void runAutomaticBackupScheduler().catch((err) => {
    logger.error({ err }, "Initial automatic backup scheduler tick failed");
  });
}