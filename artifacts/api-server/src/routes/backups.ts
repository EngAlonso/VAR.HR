import { Router } from "express";
import { and, desc, eq, isNull } from "drizzle-orm";
import { backupRecordsTable, db } from "@workspace/db";
import { createBackup, restoreBackup, backupDownloadName } from "../lib/backups";
import {
  WorkspaceAccessError,
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
  const context = await getTenantContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const rows =
    context.role === "platform_owner"
      ? await dbSelectPlatform()
      : await dbSelectCompany(context.companyId);
  res.json(rows.map(serialize));
});

async function dbSelectPlatform() {
  return db
    .select()
    .from(backupRecordsTable)
    .where(isNull(backupRecordsTable.companyId))
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
  const context = await getTenantContext(req);
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
  const record = await createBackup({
    scope,
    companyId: scope === "company" ? context.companyId : null,
    createdBy: context.accountId,
  });
  res.status(201).json(serialize(record));
});

async function ownedRecord(id: string, context: Awaited<ReturnType<typeof getTenantContext>>) {
  const [record] = await db
    .select()
    .from(backupRecordsTable)
    .where(
      context.role === "platform_owner"
        ? and(eq(backupRecordsTable.id, id), isNull(backupRecordsTable.companyId))
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
  const context = await getTenantContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${backupDownloadName(record)}"`);
  res.send(JSON.stringify(record.payload, null, 2));
});

router.delete("/backups/:id", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  await db.delete(backupRecordsTable).where(eq(backupRecordsTable.id, record.id));
  res.status(204).send();
});

router.post("/backups/:id/restore", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageBackups(context.role)) throw new WorkspaceAccessError();
  if (req.body?.confirmation !== "RESTORE") {
    res.status(400).json({ error: "Explicit RESTORE confirmation is required." });
    return;
  }
  const record = await ownedRecord(req.params.id, context);
  if (!record) throw new WorkspaceAccessError("Backup is not available for this workspace.");
  const scope = context.role === "platform_owner" ? "platform" : "company";
  const companyId = scope === "company" ? context.companyId : null;
  await createBackup({
    scope,
    companyId,
    createdBy: context.accountId,
    status: "safety",
  });
  await restoreBackup(record.id, scope, companyId);
  res.json({ restored: true, scope, backupId: record.id });
});

export default router;