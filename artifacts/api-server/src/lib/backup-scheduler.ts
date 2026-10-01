// @ts-nocheck
import { and, asc, desc, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";
import {
  backupRecordsTable,
  companiesTable,
  db,
  platformSettingsTable,
  pool,
  userAccountsTable,
} from "@workspace/db";
import { createBackup } from "./backups";
import { logger } from "./logger";

const schedulerIntervalMs = 60_000;
const advisoryLockSql = "SELECT pg_try_advisory_lock(15480, 23001) AS acquired";
const advisoryUnlockSql = "SELECT pg_advisory_unlock(15480, 23001)";

let schedulerTimer: ReturnType<typeof setInterval> | undefined;

function isDue(
  intervalMinutes: number,
  lastCreatedAt: Date | undefined,
  now: Date,
): boolean {
  if (intervalMinutes <= 0) return false;
  if (!lastCreatedAt) return true;
  return (
    now.getTime() - new Date(lastCreatedAt).getTime() >=
    intervalMinutes * 60_000
  );
}

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

export async function runAutomaticBackupScheduler() {
  const lockClient = await pool.connect();
  let acquired = false;
  let destroyLockConnection = false;
  try {
    const lockResult = await lockClient.query(advisoryLockSql);
    acquired = Boolean(lockResult.rows[0]?.acquired);
    if (!acquired) return { started: false, reason: "already_running" };

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
      return { started: true, reason: "disabled" };
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
      return { started: false, reason: "no_active_platform_owner" };
    }

    const now = new Date();
    let platformCreated = 0;
    let companyCreated = 0;
    let failures = 0;

    if (platformIntervalMinutes > 0) {
      try {
        const lastCreatedAt = await lastPlatformScheduledBackup();
        if (isDue(platformIntervalMinutes, lastCreatedAt, now)) {
          await createBackup({
            scope: "platform",
            companyId: null,
            createdBy: owner.id,
            creationMode: "scheduled",
            scheduleIntervalMinutes: platformIntervalMinutes,
          });
          platformCreated += 1;
          logger.info(
            { intervalMinutes: platformIntervalMinutes },
            "Scheduled platform backup created",
          );
        }
      } catch (err) {
        failures += 1;
        logger.error({ err }, "Scheduled platform backup failed");
      }
    }

    if (companyIntervalMinutes > 0) {
      try {
        const companies = await db
          .select({ id: companiesTable.id })
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
          if (
            !isDue(
              companyIntervalMinutes,
              latestByCompany.get(company.id),
              now,
            )
          ) {
            continue;
          }
          try {
            await createBackup({
              scope: "company",
              companyId: company.id,
              createdBy: owner.id,
              creationMode: "scheduled",
              scheduleIntervalMinutes: companyIntervalMinutes,
            });
            companyCreated += 1;
            logger.info(
              { companyId: company.id, intervalMinutes: companyIntervalMinutes },
              "Scheduled company backup created",
            );
          } catch (err) {
            failures += 1;
            logger.error(
              { err, companyId: company.id },
              "Scheduled company backup failed",
            );
          }
        }
      } catch (err) {
        failures += 1;
        logger.error({ err }, "Could not enumerate companies for scheduled backups");
      }
    }

    return {
      started: true,
      reason: "completed",
      platformCreated,
      companyCreated,
      failures,
    };
  } finally {
    if (acquired) {
      try {
        await lockClient.query(advisoryUnlockSql);
      } catch (err) {
        destroyLockConnection = true;
        logger.error({ err }, "Could not release automatic backup scheduler lock");
      }
    }
    lockClient.release(destroyLockConnection);
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