import { createHash, randomUUID } from "node:crypto";
import { backupRecordsTable, db, pool } from "@workspace/db";
import { eq } from "drizzle-orm";

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_SCHEMA_VERSION = "2026-08-22";

type BackupScope = "platform" | "company";
type JsonRecord = Record<string, unknown>;
type QueryClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: JsonRecord[] }>;
  release: () => void;
};

type BackupEnvelope = {
  manifest: {
    formatVersion: number;
    schemaVersion: string;
    createdAt: string;
    scope: BackupScope;
    companyId: string | null;
    includesExternalFiles: false;
    integrity: { algorithm: "sha256"; checksum: string };
  };
  data: Record<string, JsonRecord[]>;
};

const insertOrder = [
  "var_hr_permissions",
  "var_hr_plans",
  "var_hr_companies",
  "var_hr_departments",
  "var_hr_branches",
  "var_hr_employees",
  "var_hr_employee_hr_records",
  "var_hr_attendance_rules",
  "var_hr_leave_balances",
  "var_hr_payroll_periods",
  "var_hr_work_schedules",
  "var_hr_holidays",
  "var_hr_subscriptions",
  "var_hr_attendance",
  "var_hr_leave_requests",
  "var_hr_permission_requests",
  "var_hr_payroll_calculations",
  "var_hr_payroll_adjustments",
  "var_hr_devices",
  "var_hr_device_employee_mappings",
  "var_hr_biometric_events",
  "var_hr_biometric_sync_history",
  "var_hr_attendance_locations",
  "var_hr_user_accounts",
  "var_hr_account_permissions",
  "var_hr_employee_identities",
  "var_hr_audit_logs",
  "var_hr_auth_audit_events",
] as const;

const companyScopedTables = new Set([
  "var_hr_departments",
  "var_hr_branches",
  "var_hr_employees",
  "var_hr_employee_hr_records",
  "var_hr_attendance_rules",
  "var_hr_leave_balances",
  "var_hr_payroll_periods",
  "var_hr_work_schedules",
  "var_hr_holidays",
  "var_hr_subscriptions",
  "var_hr_attendance",
  "var_hr_leave_requests",
  "var_hr_permission_requests",
  "var_hr_payroll_calculations",
  "var_hr_payroll_adjustments",
  "var_hr_devices",
  "var_hr_device_employee_mappings",
  "var_hr_biometric_events",
  "var_hr_biometric_sync_history",
  "var_hr_attendance_locations",
  "var_hr_employee_identities",
  "var_hr_audit_logs",
  "var_hr_auth_audit_events",
]);

const companyUserTable = "var_hr_user_accounts";
const accountPermissionTable = "var_hr_account_permissions";

function quoteIdentifier(identifier: string): string {
  if (!insertOrder.includes(identifier as (typeof insertOrder)[number])) {
    throw new Error("Backup table is not allowlisted.");
  }
  return `"${identifier}"`;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    );
  }
  return value;
}

function canonicalPayload(data: Record<string, JsonRecord[]>): string {
  return JSON.stringify(
    canonicalize({ formatVersion: BACKUP_FORMAT_VERSION, data }),
  );
}

function checksumFor(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function rowsForTable(
  client: QueryClient,
  table: string,
  scope: BackupScope,
  companyId: string | null,
): Promise<JsonRecord[]> {
  const tableName = quoteIdentifier(table);
  if (scope === "company" && companyScopedTables.has(table)) {
    return (await client.query(`SELECT * FROM ${tableName} WHERE company_id = $1`, [
      companyId,
    ])).rows;
  }
  if (scope === "company" && table === companyUserTable) {
    return (await client.query(`SELECT * FROM ${tableName} WHERE company_id = $1`, [
      companyId,
    ])).rows;
  }
  if (scope === "company" && table === "var_hr_companies") {
    return (await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [
      companyId,
    ])).rows;
  }
  if (scope === "company" && table === accountPermissionTable) {
    return [];
  }
  return (await client.query(`SELECT * FROM ${tableName}`)).rows;
}

export async function buildBackupPayload(
  scope: BackupScope,
  companyId: string | null,
): Promise<{ payload: BackupEnvelope; sizeBytes: number; checksum: string }> {
  if (scope === "company" && !companyId) {
    throw new Error("Company backups require a company id.");
  }
  const client = await pool.connect();
  try {
    const data: Record<string, JsonRecord[]> = {};
    for (const table of insertOrder) {
      data[table] = await rowsForTable(client, table, scope, companyId);
    }
    if (scope === "company") {
      const accountIds = new Set(
        (data[companyUserTable] ?? [])
          .map((row) => row.id)
          .filter((id): id is string => typeof id === "string"),
      );
      data[accountPermissionTable] = (
        await client.query(
          `SELECT * FROM "${accountPermissionTable}" WHERE account_id = ANY($1::uuid[])`,
          [[...accountIds]],
        )
      ).rows;
    }
    const base = canonicalPayload(data);
    const checksum = checksumFor(base);
    const createdAt = new Date().toISOString();
    const payload: BackupEnvelope = {
      manifest: {
        formatVersion: BACKUP_FORMAT_VERSION,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        createdAt,
        scope,
        companyId,
        includesExternalFiles: false,
        integrity: { algorithm: "sha256", checksum },
      },
      data,
    };
    const serialized = JSON.stringify(payload);
    return {
      payload,
      sizeBytes: Buffer.byteLength(serialized, "utf8"),
      checksum,
    };
  } finally {
    client.release();
  }
}

export async function createBackup(input: {
  scope: BackupScope;
  companyId: string | null;
  createdBy: string;
  status?: string;
}) {
  const built = await buildBackupPayload(input.scope, input.companyId);
  const [record] = await db
    .insert(backupRecordsTable)
    .values({
      scope: input.scope,
      companyId: input.companyId,
      createdBy: input.createdBy,
      status: input.status ?? "ready",
      sizeBytes: built.sizeBytes,
      checksum: built.checksum,
      metadata: {
        formatVersion: BACKUP_FORMAT_VERSION,
        schemaVersion: BACKUP_SCHEMA_VERSION,
        scope: input.scope,
        companyId: input.companyId,
        includesExternalFiles: false,
        tableCounts: Object.fromEntries(
          Object.entries(built.payload.data).map(([table, rows]) => [
            table,
            rows.length,
          ]),
        ),
      },
      payload: built.payload,
    })
    .returning();
  return record;
}

function validateEnvelope(value: unknown, expectedScope: BackupScope, companyId: string | null): BackupEnvelope {
  if (!value || typeof value !== "object") throw new Error("Backup payload is invalid.");
  const envelope = value as Partial<BackupEnvelope>;
  const manifest = envelope.manifest;
  if (
    !manifest ||
    manifest.formatVersion !== BACKUP_FORMAT_VERSION ||
    typeof manifest.schemaVersion !== "string" ||
    manifest.scope !== expectedScope ||
    (expectedScope === "company" && manifest.companyId !== companyId) ||
    !envelope.data ||
    manifest.integrity?.algorithm !== "sha256" ||
    manifest.includesExternalFiles !== false
  ) {
    throw new Error("Backup manifest is invalid or not valid for this scope.");
  }
  const expectedChecksum = checksumFor(canonicalPayload(envelope.data));
  if (expectedChecksum !== manifest.integrity.checksum) {
    throw new Error("Backup integrity validation failed.");
  }
  for (const table of insertOrder) {
    if (!Array.isArray(envelope.data[table])) {
      throw new Error("Backup is missing an allowlisted table.");
    }
  }
  return envelope as BackupEnvelope;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validate a downloaded backup and prepare it for this environment. Company
 * exports carry the source tenant id; on migration that id is remapped to the
 * authenticated tenant, while row ids and relationships remain intact.
 */
export function validateUploadedBackup(
  value: unknown,
  expectedScope: BackupScope,
  targetCompanyId: string | null,
): { payload: BackupEnvelope; sourceCompanyId: string | null; sourceChecksum: string } {
  if (!value || typeof value !== "object") throw new Error("Backup file must contain a JSON object.");
  const candidate = value as Partial<BackupEnvelope>;
  const manifest = candidate.manifest;
  if (!manifest || typeof manifest.schemaVersion !== "string") {
    throw new Error("Backup manifest is missing or unsupported.");
  }
  if (manifest.scope !== expectedScope) {
    throw new Error("This backup scope is not permitted for the current account.");
  }
  if (expectedScope === "platform" && manifest.companyId !== null) {
    throw new Error("A platform backup must not contain a company scope.");
  }
  if (expectedScope === "company" && (typeof manifest.companyId !== "string" || !targetCompanyId)) {
    throw new Error("A company backup requires a valid source and target company.");
  }
  if (!candidate.data || typeof candidate.data !== "object" || Array.isArray(candidate.data)) {
    throw new Error("Backup data is missing.");
  }
  for (const table of insertOrder) {
    const rows = (candidate.data as Record<string, unknown>)[table];
    if (!Array.isArray(rows) || rows.some((row) => !isJsonRecord(row))) {
      throw new Error(`Backup data for ${table} is invalid.`);
    }
  }
  if (expectedScope === "company") {
    const companyRows = candidate.data.var_hr_companies as JsonRecord[];
    if (!companyRows.some((row) => row.id === manifest.companyId)) {
      throw new Error("Backup is missing its company record.");
    }
    for (const table of [...companyScopedTables, companyUserTable]) {
      for (const row of candidate.data[table] ?? []) {
        if (row.company_id !== manifest.companyId) {
          throw new Error(`Backup contains ${table} data outside its company.`);
        }
      }
    }
    const accountIds = new Set(
      (candidate.data[companyUserTable] ?? [])
        .map((row) => row.id)
        .filter((id): id is string => typeof id === "string"),
    );
    for (const row of candidate.data[accountPermissionTable] ?? []) {
      if (typeof row.account_id !== "string" || !accountIds.has(row.account_id)) {
        throw new Error("Backup contains a permission for an unknown account.");
      }
    }
  }
  // Reject session material if a hand-edited file attempts to smuggle it in.
  const serialized = JSON.stringify(candidate.data);
  if (/"(?:token|tokenHash|token_hash|sessionToken|session_token)"\s*:/.test(serialized)) {
    throw new Error("Backup contains session or token data and cannot be restored.");
  }
  // This checks the original downloaded file before any migration remapping.
  const checked = validateEnvelope(value, expectedScope, expectedScope === "company" ? manifest.companyId : null);
  const sourceCompanyId = checked.manifest.companyId;
  const data = Object.fromEntries(
    Object.entries(checked.data).map(([table, rows]) => [
      table,
      expectedScope === "company"
        ? rows.map((row) => {
            const copy = { ...row };
            if ("company_id" in copy) copy.company_id = targetCompanyId;
            if (table === "var_hr_companies" && copy.id === sourceCompanyId) copy.id = targetCompanyId;
            return copy;
          })
        : rows,
    ]),
  ) as Record<string, JsonRecord[]>;
  const checksum = checksumFor(canonicalPayload(data));
  const payload: BackupEnvelope = {
    manifest: {
      ...checked.manifest,
      companyId: expectedScope === "company" ? targetCompanyId : null,
      integrity: { algorithm: "sha256", checksum },
    },
    data,
  };
  return { payload, sourceCompanyId, sourceChecksum: checked.manifest.integrity.checksum };
}

export async function createUploadedBackup(input: {
  value: unknown;
  scope: BackupScope;
  companyId: string | null;
  createdBy: string;
}) {
  const checked = validateUploadedBackup(input.value, input.scope, input.companyId);
  const serialized = JSON.stringify(checked.payload);
  const [record] = await db.insert(backupRecordsTable).values({
    scope: input.scope,
    companyId: input.companyId,
    createdBy: input.createdBy,
    status: "ready",
    sizeBytes: Buffer.byteLength(serialized, "utf8"),
    checksum: checked.payload.manifest.integrity.checksum,
    metadata: {
      formatVersion: BACKUP_FORMAT_VERSION,
      schemaVersion: checked.payload.manifest.schemaVersion,
      scope: input.scope,
      companyId: input.companyId,
      sourceCompanyId: checked.sourceCompanyId,
      sourceChecksum: checked.sourceChecksum,
      imported: true,
      includesExternalFiles: false,
      tableCounts: Object.fromEntries(
        Object.entries(checked.payload.data).map(([table, rows]) => [table, rows.length]),
      ),
    },
    payload: checked.payload,
  }).returning();
  return record;
}

const deleteOrder = [...insertOrder].reverse();

async function deleteScope(
  client: QueryClient,
  scope: BackupScope,
  companyId: string | null,
  preservedAccountId: string | null,
): Promise<void> {
  if (scope === "platform") {
    await client.query(
      `DELETE FROM "var_hr_auth_sessions" WHERE account_id <> $1`,
      [preservedAccountId],
    );
    // Platform restores preserve user accounts, but employees are replaced.
    // Clear these FK references inside the same transaction so PostgreSQL can
    // remove the old employees without deleting or disabling authentication.
    await client.query(
      `UPDATE "${companyUserTable}" SET employee_id = NULL WHERE employee_id IS NOT NULL`,
    );
    for (const table of deleteOrder.filter(
      (table) =>
        table !== companyUserTable && table !== "var_hr_companies",
    )) {
      await client.query(`DELETE FROM ${quoteIdentifier(table)}`);
    }
    return;
  }
  const accountIds = (
    await client.query(
      `SELECT id FROM "${companyUserTable}" WHERE company_id = $1`,
      [companyId],
    )
  ).rows.map((row: { id: string }) => row.id);
  await client.query(
    `DELETE FROM "var_hr_auth_sessions" WHERE account_id = ANY($1::uuid[])`,
    [accountIds],
  );
  await client.query(
    `DELETE FROM "${accountPermissionTable}" WHERE account_id = ANY($1::uuid[])`,
    [accountIds],
  );
  if (accountIds.length) {
    await client.query(
      `UPDATE "var_hr_backup_records"
       SET created_by = (
         SELECT id FROM "${companyUserTable}"
         WHERE account_type = 'platform_owner'
         ORDER BY id
         LIMIT 1
       )
       WHERE created_by = ANY($1::uuid[])`,
      [accountIds],
    );
  }
  for (const table of deleteOrder) {
    if (table === accountPermissionTable || table === "var_hr_companies") {
      continue;
    }
    if (companyScopedTables.has(table) || table === companyUserTable) {
      await client.query(
        `DELETE FROM ${quoteIdentifier(table)} WHERE company_id = $1`,
        [companyId],
      );
    }
  }
}

async function reconcilePlatformAccountEmployees(
  client: QueryClient,
  data: Record<string, JsonRecord[]>,
): Promise<void> {
  for (const row of data[companyUserTable] ?? []) {
    if (typeof row.username !== "string" || typeof row.employee_id !== "string") {
      continue;
    }
    // Existing accounts are preserved by username. New accounts already carry
    // their restored employee_id from insertScope; this also safely updates
    // preserved accounts to the employee id from the uploaded snapshot.
    await client.query(
      `UPDATE "${companyUserTable}"
       SET employee_id = $1
       WHERE username = $2`,
      [row.employee_id, row.username],
    );
  }
}

async function reconcilePlatformCompanies(
  client: QueryClient,
  data: Record<string, JsonRecord[]>,
): Promise<Record<string, JsonRecord[]>> {
  const existing = await client.query(
    `SELECT id::text, slug FROM "var_hr_companies"`,
  );
  const idsBySlug = new Map(
    existing.rows
      .filter((row) => typeof row.id === "string" && typeof row.slug === "string")
      .map((row) => [row.slug as string, row.id as string]),
  );
  const sourceToTarget = new Map<string, string>();
  for (const row of data["var_hr_companies"] ?? []) {
    if (typeof row.id !== "string" || typeof row.slug !== "string") continue;
    const targetId = idsBySlug.get(row.slug) ?? row.id;
    sourceToTarget.set(row.id, targetId);
  }
  return Object.fromEntries(
    Object.entries(data).map(([table, rows]) => [
      table,
      rows.map((row) => {
        const copy = { ...row };
        if (typeof copy.company_id === "string") {
          copy.company_id = sourceToTarget.get(copy.company_id) ?? copy.company_id;
        }
        if (table === "var_hr_companies" && typeof copy.id === "string") {
          copy.id = sourceToTarget.get(copy.id) ?? copy.id;
        }
        return copy;
      }),
    ]),
  );
}

async function reconcilePlatformAccounts(
  client: QueryClient,
  data: Record<string, JsonRecord[]>,
): Promise<Record<string, JsonRecord[]>> {
  const existing = await client.query(
    `SELECT id::text, username FROM "${companyUserTable}"`,
  );
  const idsByUsername = new Map(
    existing.rows
      .filter((row) => typeof row.id === "string" && typeof row.username === "string")
      .map((row) => [row.username as string, row.id as string]),
  );
  const sourceToTarget = new Map<string, string>();
  for (const row of data[companyUserTable] ?? []) {
    if (typeof row.id !== "string" || typeof row.username !== "string") continue;
    sourceToTarget.set(row.id, idsByUsername.get(row.username) ?? row.id);
  }
  return Object.fromEntries(
    Object.entries(data).map(([table, rows]) => [
      table,
      rows.map((row) => {
        const copy = { ...row };
        if (typeof copy.account_id === "string") {
          copy.account_id = sourceToTarget.get(copy.account_id) ?? copy.account_id;
        }
        return copy;
      }),
    ]),
  );
}

async function insertScope(
  client: QueryClient,
  scope: BackupScope,
  companyId: string | null,
  data: Record<string, JsonRecord[]>,
): Promise<void> {
  for (const table of insertOrder) {
    if (scope === "company" && table === "var_hr_permissions") continue;
    if (scope === "company" && table === "var_hr_plans") continue;
    for (const row of data[table] ?? []) {
      if (scope === "company" && table === companyUserTable && row.company_id !== companyId) {
        throw new Error("Backup contains an account outside its company.");
      }
      if (
        scope === "company" &&
        companyScopedTables.has(table) &&
        row.company_id !== companyId
      ) {
        throw new Error("Backup contains data outside its company.");
      }
      if (
        scope === "company" &&
        table === "var_hr_companies" &&
        row.id !== companyId
      ) {
        throw new Error("Backup contains a company outside the restore scope.");
      }
      // jsonb_populate_record fills omitted columns with NULL rather than
      // applying the table default. Older backups predate the department
      // management fields, so normalize those rows without changing the
      // stored payload or its integrity checksum.
      const restoreRow =
        table === "var_hr_departments"
          ? {
              ...row,
              name_ar: row.name_ar ?? "",
              description: row.description ?? null,
              manager_id: row.manager_id ?? null,
              default_schedule_id: row.default_schedule_id ?? null,
              active: row.active ?? true,
            }
          : row;
      const json = JSON.stringify(restoreRow);
      await client.query(
        `INSERT INTO ${quoteIdentifier(table)} SELECT * FROM jsonb_populate_record(NULL::${quoteIdentifier(table)}, $1::jsonb) ON CONFLICT DO NOTHING`,
        [json],
      );
    }
  }
}

export async function restoreBackup(
  recordId: string,
  expectedScope: BackupScope,
  companyId: string | null,
  preservedAccountId: string | null = null,
): Promise<void> {
  const [record] = await db
    .select()
    .from(backupRecordsTable)
    .where(eq(backupRecordsTable.id, recordId))
    .limit(1);
  if (!record) throw new Error("Backup not found.");
  if (record.scope !== expectedScope || (expectedScope === "company" && record.companyId !== companyId)) {
    throw new Error("Backup is not available for this workspace.");
  }
  const envelope = validateEnvelope(record.payload, expectedScope, companyId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await deleteScope(client, expectedScope, companyId, preservedAccountId);
    const restoreData =
      expectedScope === "platform"
        ? await reconcilePlatformAccounts(
            client,
            await reconcilePlatformCompanies(client, envelope.data),
          )
        : envelope.data;
    await insertScope(client, expectedScope, companyId, restoreData);
    if (expectedScope === "platform") {
      await reconcilePlatformAccountEmployees(client, restoreData);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function backupDownloadName(record: { scope: string; createdAt: Date; id: string }): string {
  const stamp = record.createdAt.toISOString().replace(/[:.]/g, "-");
  return `var-hr-${record.scope}-backup-${stamp}-${record.id.slice(0, 8)}.json`;
}