import { Router } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { backupRecordsTable, companiesTable, db } from "@workspace/db";
import { createBackup, createUploadedBackup, restoreBackup, backupDownloadName } from "../lib/backups";
import { writeAuthAudit } from "../lib/auth";
import {
  WorkspaceAccessError,
  getWorkspaceContext,
  getTenantContext,
} from "../lib/tenant-context";

const router = Router();

function canManageBackups(role: string): boolean {
  return role === "platform_owner" || role === "company_owner";
}

function isPlatformScope(value: unknown): value is "platform" {
  return value === "platform";
}

function isCompanyScope(value: unknown): value is "company" {
  return value === "company";
}

function serialize(record: typeof backupRecordsTable.$inferSelect) {
  return {
    id: record.id,
    scope: record.scope,
    companyId: record.companyId,
    status: record.status,
    sizeBytes: record.sizeBytes,
    checksum: record.checksum,
    metadata: record.metadata,
    createdAt: record.createdAt.toISOString(),
  };
}

router.get("/backups", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const rows =
    context.role === "platform_owner"
      ? await dbSelectPlatform(
          req.query.scope === "company"
            ? String(req.query.companyId ?? "")
            : undefined,
        )
      : await dbSelectCompany(context.companyId);
  res.json(rows.map(serialize));
});

async function dbSelectPlatform(companyId?: string) {
  return db
    .select()
    .from(backupRecordsTable)
    .where(
      companyId
        ? and(
            eq(backupRecordsTable.scope, "company"),
            eq(backupRecordsTable.companyId, companyId),
          )
        : isNull(backupRecordsTable.companyId),
    )
    .orderBy(desc(backupRecordsTable.createdAt));
}

async function dbSelectCompany(companyId: string) {
  return db
    .select()
    .from(backupRecordsTable)
    .where(
      and(
        eq(backupRecordsTable.scope, "company"),
        eq(backupRecordsTable.companyId, companyId),
      ),
    )
    .orderBy(desc(backupRecordsTable.createdAt));
}

router.post("/backups", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const requestedScope = req.body?.scope;
  const scope = isPlatformScope(requestedScope)
    ? "platform"
    : isCompanyScope(requestedScope)
      ? "company"
      : null;
  if (!scope || (scope === "platform" && context.role !== "platform_owner")) {
    throw new WorkspaceAccessError("This account cannot create that backup scope.");
  }
  const requestedCompanyId =
    scope === "company" && context.role === "platform_owner"
      ? z.string().uuid().safeParse(req.body?.companyId)
      : null;
  const companyId =
    scope === "company"
      ? context.role === "platform_owner"
        ? requestedCompanyId?.success
          ? requestedCompanyId.data
          : null
        : context.companyId
      : null;
  if (scope === "company" && !companyId) {
    throw new WorkspaceAccessError("A valid company ID is required.");
  }
  if (scope === "company") {
    const [company] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId!))
      .limit(1);
    if (!company) throw new WorkspaceAccessError("Company not found.");
  }
  const record = await createBackup({
    scope,
    companyId,
    createdBy: context.accountId,
  });
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: record.companyId,
    action: "backup_created",
    entityType: "backup",
    entityId: record.id,
    metadata: { scope: record.scope },
  });
  res.status(201).json(serialize(record));
});

router.post("/backups/upload", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const scope = context.role === "platform_owner" ? "platform" : "company";
  const value = req.body?.backup;
  if (!value) {
    res.status(400).json({ error: "Upload a JSON backup file." });
    return;
  }
  let record;
  try {
    record = await createUploadedBackup({
      value,
      scope,
      companyId: scope === "company" ? context.companyId : null,
      createdBy: context.accountId,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Backup validation failed.",
      code: "BACKUP_VALIDATION_FAILED",
    });
    return;
  }
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: record.companyId,
    action: "backup_uploaded",
    entityType: "backup",
    entityId: record.id,
    metadata: { scope: record.scope, sourceChecksum: record.metadata && typeof record.metadata === "object" && "sourceChecksum" in record.metadata ? record.metadata.sourceChecksum : undefined },
  });
  res.status(201).json(serialize(record));
});

async function ownedRecord(
  id: string,
  context: Awaited<ReturnType<typeof getWorkspaceContext>>,
) {
  const [record] = await db
    .select()
    .from(backupRecordsTable)
    .where(
      context.role === "platform_owner"
        ? eq(backupRecordsTable.id, id)
        : and(
            eq(backupRecordsTable.id, id),
            eq(backupRecordsTable.scope, "company"),
            eq(backupRecordsTable.companyId, context.companyId),
          ),
    )
    .limit(1);
  return record;
}

router.get("/backups/:id/download", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${backupDownloadName(record)}"`);
  res.send(JSON.stringify(record.payload, null, 2));
});

router.delete("/backups/:id", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  await db.delete(backupRecordsTable).where(eq(backupRecordsTable.id, record.id));
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: record.companyId,
    action: "backup_deleted",
    entityType: "backup",
    entityId: record.id,
    metadata: { scope: record.scope },
  });
  res.status(204).send();
});

router.post("/backups/:id/restore", async (req, res): Promise<void> => {
  const context = await getWorkspaceContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  if (req.body?.confirmation !== "RESTORE") {
    res.status(400).json({ error: "Explicit RESTORE confirmation is required." });
    return;
  }
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  if (record.scope !== "platform" && record.scope !== "company") {
    throw new WorkspaceAccessError("Backup scope is invalid.");
  }
  const scope = record.scope;
  const companyId = record.companyId;
  await createBackup({
    scope,
    companyId,
    createdBy: context.accountId,
    status: "safety",
  });
  await restoreBackup(record.id, scope, companyId, context.accountId);
  await writeAuthAudit({
    accountId: context.accountId,
    companyId,
    action: "backup_restored",
    entityType: "backup",
    entityId: record.id,
    metadata: { scope },
  });
  res.json({ restored: true, scope, backupId: record.id });
});

export default router;