import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  auditLogsTable,
  branchesTable,
  companiesTable,
  db,
  departmentsTable,
  employeesTable,
  authAuditEventsTable,
  userAccountsTable,
} from "@workspace/db";
import {
  hashPassword,
  loadAuthenticatedAccount,
  verifyPassword,
  writeAuthAudit,
} from "../lib/auth";
import { requirePlatformOwner } from "../lib/tenant-context";
import { z } from "zod";

type EntityConfig = {
  table: string;
  label: string;
  columns: string[];
  editable: string[];
  supportEditable?: string[];
  canArchive?: boolean;
  canDelete?: boolean;
  hasUpdatedAt?: boolean;
  companyColumn?: string;
  orderColumn?: string;
};

const entities: Record<string, EntityConfig> = {
  companies: {
    table: "var_hr_companies",
    label: "Companies",
    columns: [
      "id",
      "name",
      "slug",
      "address",
      "timezone",
      "currency",
      "active",
      "created_at",
    ],
    editable: ["name", "slug", "address", "timezone", "currency", "active"],
    companyColumn: "id",
  },
  departments: {
    table: "var_hr_departments",
    label: "Departments",
    columns: [
      "id",
      "company_id",
      "name",
      "name_ar",
      "description",
      "manager_id",
      "default_schedule_id",
      "active",
      "created_at",
    ],
    editable: ["name"],
    supportEditable: ["name", "name_ar", "description", "manager_id", "active"],
    canArchive: true,
    companyColumn: "company_id",
  },
  branches: {
    table: "var_hr_branches",
    label: "Branches",
    columns: [
      "id",
      "company_id",
      "name",
      "city",
      "gps_enabled",
      "latitude",
      "longitude",
      "radius_meters",
      "created_at",
    ],
    editable: [
      "name",
      "city",
      "gps_enabled",
      "latitude",
      "longitude",
      "radius_meters",
    ],
    supportEditable: ["name", "city", "gps_enabled", "latitude", "longitude", "radius_meters"],
    companyColumn: "company_id",
  },
  employees: {
    table: "var_hr_employees",
    label: "Employees",
    columns: [
      "id",
      "company_id",
      "employee_number",
      "first_name",
      "last_name",
      "email",
      "phone",
      "department_id",
      "branch_id",
      "status",
      "role",
      "joined_on",
      "salary",
      "created_at",
      "updated_at",
    ],
    editable: [
      "employee_number",
      "first_name",
      "last_name",
      "email",
      "phone",
      "department_id",
      "branch_id",
      "status",
      "role",
      "joined_on",
      "salary",
    ],
    supportEditable: [
      "employee_number",
      "first_name",
      "last_name",
      "email",
      "phone",
      "department_id",
      "branch_id",
      "status",
      "role",
    ],
    canArchive: true,
    hasUpdatedAt: true,
    companyColumn: "company_id",
  },
  attendance: {
    table: "var_hr_attendance",
    label: "Attendance",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "date",
      "status",
      "check_in",
      "check_out",
      "worked_hours",
      "overtime_hours",
      "created_at",
      "updated_at",
    ],
    editable: [
      "date",
      "status",
      "check_in",
      "check_out",
      "worked_hours",
      "overtime_hours",
    ],
    hasUpdatedAt: true,
    companyColumn: "company_id",
  },
  devices: {
    table: "var_hr_devices",
    label: "Devices",
    columns: [
      "id",
      "company_id",
      "name",
      "manufacturer",
      "model",
      "branch_id",
      "connection_type",
      "device_identifier",
      "status",
      "integration_state",
      "connection_state",
      "created_at",
    ],
    companyColumn: "company_id",
    editable: [
      "name",
      "manufacturer",
      "model",
      "branch_id",
      "connection_type",
      "device_identifier",
      "status",
      "integration_state",
      "connection_state",
    ],
    orderColumn: "last_sync",
  },
  holidays: {
    table: "var_hr_holidays",
    label: "Holidays",
    columns: ["id", "company_id", "name", "date", "recurring", "created_at"],
    editable: ["name", "date"],
    hasUpdatedAt: true,
    companyColumn: "company_id",
  },
  payroll_periods: {
    table: "var_hr_payroll_periods",
    label: "Payroll periods",
    columns: [
      "id",
      "company_id",
      "label",
      "from",
      "to",
      "status",
      "employee_count",
      "total_net",
      "calculated_at",
      "finalized_at",
    ],
    companyColumn: "company_id",
    editable: ["label", "from", "to", "status"],
    orderColumn: "to",
  },
  users: {
    table: "var_hr_user_accounts",
    label: "Users and accounts",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "username",
      "full_name",
      "display_role",
      "active",
      "created_at",
      "last_login_at",
    ],
    editable: [],
    companyColumn: "company_id",
  },
  shifts: {
    table: "var_hr_work_schedules",
    label: "Work schedules",
    columns: [
      "id",
      "company_id",
      "name",
      "name_ar",
      "start_time",
      "end_time",
      "active",
      "created_at",
    ],
    editable: [],
    companyColumn: "company_id",
  },
  shift_assignments: {
    table: "var_hr_employee_schedule_assignments",
    label: "Employee shift assignments",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "schedule_id",
      "effective_from",
      "effective_to",
      "created_at",
    ],
    editable: [],
    companyColumn: "company_id",
  },
  attendance_rules: {
    table: "var_hr_attendance_rules",
    label: "Attendance rules",
    columns: [
      "id",
      "company_id",
      "schedule_name",
      "work_start",
      "work_end",
      "required_hours",
      "grace_minutes",
      "overtime_eligible",
      "updated_at",
    ],
    editable: [],
    companyColumn: "company_id",
  },
  attendance_calculations: {
    table: "var_hr_attendance_calculations",
    label: "Attendance calculations",
    columns: [
      "id",
      "company_id",
      "attendance_id",
      "employee_id",
      "attendance_date",
      "attendance_state",
    ],
    editable: [],
    companyColumn: "company_id",
    orderColumn: "calculated_at",
  },
  leave_requests: {
    table: "var_hr_leave_requests",
    label: "Leave requests",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "type",
      "from",
      "to",
      "status",
      "submitted_at",
    ],
    editable: [],
    companyColumn: "company_id",
    orderColumn: "submitted_at",
  },
  permission_requests: {
    table: "var_hr_permission_requests",
    label: "Permission requests",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "date",
      "status",
      "submitted_at",
    ],
    editable: [],
    companyColumn: "company_id",
    orderColumn: "submitted_at",
  },
  permissions: {
    table: "var_hr_permissions",
    label: "Permissions",
    columns: ["key", "label", "description", "created_at"],
    editable: [],
    canDelete: false,
  },
  payroll_calculations: {
    table: "var_hr_payroll_calculations",
    label: "Payroll calculations",
    columns: [
      "id",
      "company_id",
      "period_id",
      "employee_id",
      "net_salary",
      "calculated_at",
    ],
    editable: [],
    companyColumn: "company_id",
    orderColumn: "calculated_at",
  },
  subscriptions: {
    table: "var_hr_subscriptions",
    label: "Subscriptions",
    columns: [
      "id",
      "company_id",
      "plan_id",
      "status",
      "employee_limit",
      "monthly_price",
      "annual_price",
    ],
    editable: [],
    companyColumn: "company_id",
    orderColumn: "started_at",
  },
  audit_logs: {
    table: "var_hr_audit_logs",
    label: "Audit logs",
    columns: [
      "id",
      "company_id",
      "actor_type",
      "actor_id",
      "action",
      "entity_type",
      "entity_id",
      "created_at",
    ],
    editable: [],
    canDelete: false,
    companyColumn: "company_id",
  },
  backups: {
    table: "var_hr_backup_records",
    label: "Backups",
    columns: [
      "id",
      "company_id",
      "scope",
      "status",
      "size_bytes",
      "checksum",
      "created_at",
    ],
    editable: [],
    companyColumn: "company_id",
  },
};

const idSchema = z.string().uuid();
const selfAccountSchema = z.object({
  fullName: z.string().trim().min(1).max(160).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^\+?[0-9 ()-]+$/, "Invalid phone number.")
    .optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6).max(256).optional(),
});
const supportValuesSchema = z.record(z.string(), z.unknown());
const supportFields: Record<string, string[]> = {
  employees: [
    "employee_number",
    "first_name",
    "last_name",
    "email",
    "phone",
    "department_id",
    "branch_id",
    "status",
    "role",
  ],
  departments: ["name", "name_ar", "description", "manager_id", "active"],
  branches: [
    "name",
    "city",
    "gps_enabled",
    "latitude",
    "longitude",
    "radius_meters",
  ],
};
const safeHistoryValue = (value: unknown): unknown => {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(safeHistoryValue);
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (/password|token|secret|session|api.?key|credential/i.test(key)) continue;
    result[key] = safeHistoryValue(item);
  }
  return result;
};

function configFor(name: string): EntityConfig {
  const config = entities[name];
  if (!config) throw new Error("Unknown administration entity.");
  return config;
}

function sqlIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function safeRow(row: Record<string, unknown>) {
  const copy = { ...row };
  delete copy.password_hash;
  delete copy.token_hash;
  delete copy.payload;
  delete copy.raw_payload;
  delete copy.inputs_snapshot;
  return copy;
}

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function xlsxBuffer(rows: string[][], sheetName: string): Buffer {
  const escapeXml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const columnName = (index: number) => {
    let value = "";
    let current = index;
    do {
      value = String.fromCharCode(65 + (current % 26)) + value;
      current = Math.floor(current / 26) - 1;
    } while (current >= 0);
    return value;
  };
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map(
            (value, columnIndex) =>
              `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(
                value,
              )}</t></is></c>`,
          )
          .join("")}</row>`,
    )
    .join("")}</sheetData></worksheet>`;
  const files = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
    ],
    [
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sheetName.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    ],
    ["xl/worksheets/sheet1.xml", sheet],
  ].map(([name, content]) => ({
    name,
    data: Buffer.from(content),
  }));
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name);
    const checksum = crc32(file.data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt32LE(checksum, 14);
    header.writeUInt32LE(file.data.length, 18);
    header.writeUInt32LE(file.data.length, 22);
    header.writeUInt16LE(name.length, 26);
    header.writeUInt16LE(0, 28);
    local.push(header, name, file.data);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0);
    directory.writeUInt16LE(20, 4);
    directory.writeUInt16LE(20, 6);
    directory.writeUInt16LE(0, 8);
    directory.writeUInt16LE(0, 10);
    directory.writeUInt16LE(0, 12);
    directory.writeUInt16LE(0, 14);
    directory.writeUInt32LE(checksum, 16);
    directory.writeUInt32LE(file.data.length, 20);
    directory.writeUInt32LE(file.data.length, 24);
    directory.writeUInt16LE(name.length, 28);
    directory.writeUInt16LE(0, 30);
    directory.writeUInt16LE(0, 32);
    directory.writeUInt16LE(0, 34);
    directory.writeUInt16LE(0, 36);
    directory.writeUInt32LE(0, 38);
    directory.writeUInt32LE(offset, 42);
    central.push(directory, name);
    offset += header.length + name.length + file.data.length;
  }
  const centralData = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralData.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralData, end]);
}

async function audit(
  req: Request,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const account = await loadAuthenticatedAccount(req);
  await writeAuthAudit({
    accountId: account?.id,
    companyId: null,
    action,
    entityType: `database:${entity}`,
    entityId,
    metadata,
  });
}

const router: IRouter = Router();

router.get("/platform/database/entities", async (req, res): Promise<void> => {
  await requirePlatformOwner(req);
  res.json(
    Object.entries(entities).map(([key, value]) => ({
      key,
      label: value.label,
      columns: value.columns,
      editable: value.editable,
      supportEditable: value.supportEditable ?? [],
      canArchive: value.canArchive ?? false,
      canDelete: value.canDelete ?? true,
    })),
  );
});

router.get("/platform/database/:entity", async (req, res): Promise<void> => {
  const config = configFor(req.params.entity);
  await requirePlatformOwner(req);
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const companyId =
    typeof req.query.companyId === "string" ? req.query.companyId.trim() : "";
  if (companyId && !idSchema.safeParse(companyId).success) {
    res.status(400).json({ error: "A valid company filter is required." });
    return;
  }
  const columns = config.columns.map(sqlIdentifier).join(", ");
  const predicates = [
    ...(companyId && config.companyColumn
      ? [
          `${sqlIdentifier(config.companyColumn)} = ${JSON.stringify(companyId)}`,
        ]
      : []),
    ...(search
      ? [
          `to_jsonb(${sqlIdentifier(config.table)})::text ILIKE ${JSON.stringify(`%${search}%`)}`,
        ]
      : []),
  ];
  const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
  const query = sql.raw(
    `SELECT ${columns} FROM ${sqlIdentifier(config.table)}${where} ORDER BY ${sqlIdentifier(config.orderColumn ?? "created_at")} DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`,
  );
  const result = await db.execute(query);
  const companies = await db
    .select({ id: companiesTable.id, name: companiesTable.name })
    .from(companiesTable);
  const companyNames = new Map(
    companies.map((company) => [company.id, company.name]),
  );
  const rows = (result.rows as Record<string, unknown>[]).map((row) => ({
    ...safeRow(row),
    ...(req.params.entity !== "companies"
      ? {
          company_name:
            companyNames.get(String(row.company_id ?? "")) ?? "Unknown company",
        }
      : {}),
  }));
  await audit(req, "database_view", req.params.entity, null, {
    count: rows.length,
    search: search || undefined,
    companyId: companyId || undefined,
  });
  res.json({
    entity: req.params.entity,
    label: config.label,
    columns:
      req.params.entity === "companies"
        ? config.columns
        : [...config.columns, "company_name"],
    editable: config.editable,
    supportEditable: config.supportEditable ?? [],
    canArchive: config.canArchive ?? false,
    canDelete: config.canDelete ?? true,
    rows,
  });
});

router.get(
  "/platform/database/:entity/export",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    await requirePlatformOwner(req);
    const companyId =
      typeof req.query.companyId === "string" ? req.query.companyId.trim() : "";
    if (companyId && !idSchema.safeParse(companyId).success) {
      res.status(400).json({ error: "A valid company filter is required." });
      return;
    }
    const where =
      companyId && config.companyColumn
        ? ` WHERE ${config.companyColumn} = ${JSON.stringify(companyId)}`
        : "";
    const result = await db.execute(
      sql.raw(
        `SELECT ${config.columns.map(sqlIdentifier).join(", ")} FROM ${sqlIdentifier(config.table)}${where} ORDER BY ${sqlIdentifier(config.orderColumn ?? "created_at")} DESC NULLS LAST LIMIT 5000`,
      ),
    );
    const rows = (result.rows as Record<string, unknown>[]).map(safeRow);
    const values = [
      config.columns,
      ...rows.map((row) =>
        config.columns.map((column) => String(row[column] ?? "")),
      ),
    ];
    const workbook = xlsxBuffer(values, config.label);
    await audit(req, "database_export", req.params.entity, null, {
      count: rows.length,
      format: "xlsx",
      companyId: companyId || undefined,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.entity}.xlsx"`,
    );
    res.send(workbook);
  },
);

router.get(
  "/platform/database/:entity/:id/history",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    await requirePlatformOwner(req);
    if (!idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "A valid record id is required." });
      return;
    }
    const businessEntity =
      req.params.entity === "employees"
        ? "employee"
        : req.params.entity === "departments"
          ? "department"
          : req.params.entity === "branches"
            ? "branch"
            : req.params.entity;
    const [business, platform] = await Promise.all([
      db
        .select({
          id: auditLogsTable.id,
          action: auditLogsTable.action,
          entityType: auditLogsTable.entityType,
          entityId: auditLogsTable.entityId,
          actorType: auditLogsTable.actorType,
          actorId: auditLogsTable.actorId,
          before: auditLogsTable.before,
          after: auditLogsTable.after,
          createdAt: auditLogsTable.createdAt,
        })
        .from(auditLogsTable)
        .where(
          and(
            eq(auditLogsTable.entityType, businessEntity),
            eq(auditLogsTable.entityId, req.params.id),
          ),
        ),
      db
        .select({
          id: authAuditEventsTable.id,
          action: authAuditEventsTable.action,
          entityType: authAuditEventsTable.entityType,
          entityId: authAuditEventsTable.entityId,
          actorType: sql<string>`'platform'`,
          actorId: authAuditEventsTable.accountId,
          metadata: authAuditEventsTable.metadata,
          createdAt: authAuditEventsTable.createdAt,
        })
        .from(authAuditEventsTable)
        .where(
          and(
            eq(authAuditEventsTable.entityType, `database:${req.params.entity}`),
            eq(authAuditEventsTable.entityId, req.params.id),
          ),
        ),
    ]);
    const actorIds = [
      ...business.map((item) => item.actorId),
      ...platform.map((item) => item.actorId),
    ].filter((id): id is string => Boolean(id));
    const accounts = actorIds.length
      ? await db
          .select({
            id: userAccountsTable.id,
            fullName: userAccountsTable.fullName,
            displayRole: userAccountsTable.displayRole,
          })
          .from(userAccountsTable)
      : [];
    const accountById = new Map(accounts.map((account) => [account.id, account]));
    const history = [
      ...business.map((item) => ({
        ...item,
        actor: accountById.get(item.actorId ?? "") ?? null,
        before: safeHistoryValue(item.before),
        after: safeHistoryValue(item.after),
      })),
      ...platform.map((item) => ({
        ...item,
        actor: accountById.get(item.actorId ?? "") ?? null,
        metadata: safeHistoryValue(item.metadata),
      })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
    res.json({ entity: req.params.entity, label: config.label, history });
  },
);

router.patch(
  "/platform/database/:entity/:id/support",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    const context = await requirePlatformOwner(req);
    if (!["employees", "departments", "branches"].includes(req.params.entity)) {
      res.status(403).json({ error: "This entity does not support platform editing." });
      return;
    }
    if (!idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "A valid record id is required." });
      return;
    }
    const parsed = supportValuesSchema.safeParse(req.body?.values);
    const allowed = supportFields[req.params.entity];
    if (!parsed.success || !allowed || !Object.keys(parsed.data).length) {
      res.status(400).json({ error: "Provide supported fields to update." });
      return;
    }
    const keys = Object.keys(parsed.data);
    if (keys.some((key) => !allowed.includes(key))) {
      res.status(400).json({ error: "One or more support fields are not allowed." });
      return;
    }
    for (const key of keys) {
      const value = parsed.data[key];
      if (
        ["department_id", "branch_id", "manager_id"].includes(key) &&
        value !== null &&
        (!idSchema.safeParse(value).success)
      ) {
        res.status(400).json({ error: "Referenced records must use valid ids." });
        return;
      }
      if (
        ["name", "name_ar", "description", "employee_number", "first_name", "last_name", "email", "phone", "city", "status", "role"].includes(key) &&
        value !== null &&
        typeof value !== "string"
      ) {
        res.status(400).json({ error: `The ${key} field must be text.` });
        return;
      }
    }
    const [before] = (
      await db.execute(
        sql.raw(
          `SELECT * FROM ${config.table} WHERE id = ${JSON.stringify(req.params.id)} LIMIT 1`,
        ),
      )
    ).rows as Record<string, unknown>[];
    if (!before) {
      res.status(404).json({ error: "Record not found." });
      return;
    }
    const companyId = String(before.company_id ?? "");
    if (!idSchema.safeParse(companyId).success) {
      res.status(400).json({ error: "The record has no valid company scope." });
      return;
    }
    if (req.params.entity === "employees") {
      const departmentId = parsed.data.department_id ?? before.department_id;
      const branchId = parsed.data.branch_id ?? before.branch_id;
      const references = await db
        .select({ id: departmentsTable.id })
        .from(departmentsTable)
        .where(eq(employeesTable.companyId, companyId));
      const branches = await db
        .select({ id: branchesTable.id })
        .from(branchesTable)
        .where(eq(branchesTable.companyId, companyId));
      if (
        !branches.some((row) => row.id === branchId) ||
        (departmentId !== null &&
          !references.some((row) => row.id === departmentId))
      ) {
        res.status(400).json({ error: "Referenced records must belong to the same company." });
        return;
      }
    }
    if (req.params.entity === "departments" && parsed.data.manager_id) {
      const [manager] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.id, parsed.data.manager_id as string),
            eq(employeesTable.companyId, companyId),
          ),
        )
        .limit(1);
      if (!manager) {
        res.status(400).json({ error: "The manager must belong to the same company." });
        return;
      }
    }
    const normalizedValues = Object.fromEntries(
      keys.map((key) => {
        const value = parsed.data[key];
        if (key === "active" && typeof value === "string") {
          return [key, value === "true"];
        }
        if (
          ["latitude", "longitude", "radius_meters"].includes(key) &&
          typeof value === "string"
        ) {
          return [key, value === "" ? null : Number(value)];
        }
        return [key, value];
      }),
    );
    if (
      Object.values(normalizedValues).some(
        (value) => typeof value === "number" && Number.isNaN(value),
      )
    ) {
      res.status(400).json({ error: "Numeric support fields must be valid numbers." });
      return;
    }
    const setParts = keys.map(
      (key) => sql`${sql.raw(key)} = ${normalizedValues[key]}`,
    );
    if (req.params.entity === "employees") setParts.push(sql`updated_at = now()`);
    const result = await db.execute(
      sql`UPDATE ${sql.raw(config.table)} SET ${sql.join(setParts, sql`, `)} WHERE id = ${req.params.id} AND company_id = ${companyId} RETURNING ${sql.raw(config.columns.join(", "))}`,
    );
    const after = safeRow((result.rows[0] ?? {}) as Record<string, unknown>);
    await db.insert(auditLogsTable).values({
      companyId,
      actorType: "platform_owner",
      actorId: context.accountId,
      action: "support_updated",
      entityType: req.params.entity,
      entityId: req.params.id,
      before: safeHistoryValue(before),
      after,
    });
    await writeAuthAudit({
      accountId: context.accountId,
      companyId,
      action: "database_support_updated",
      entityType: `database:${req.params.entity}`,
      entityId: req.params.id,
      metadata: { fields: keys, actorRole: "platform_owner" },
    });
    res.json({ row: after });
  },
);

router.post(
  "/platform/database/:entity/:id/archive",
  async (req, res): Promise<void> => {
    const context = await requirePlatformOwner(req);
    if (!["employees", "departments"].includes(req.params.entity) || !idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "This record cannot be archived from Database Management." });
      return;
    }
    const table = req.params.entity === "employees" ? "var_hr_employees" : "var_hr_departments";
    const field = req.params.entity === "employees" ? "status" : "active";
    const value = req.params.entity === "employees" ? "inactive" : false;
    const [before] = (
      await db.execute(sql.raw(`SELECT * FROM ${table} WHERE id = ${JSON.stringify(req.params.id)} LIMIT 1`))
    ).rows as Record<string, unknown>[];
    if (!before || !idSchema.safeParse(String(before.company_id ?? "")).success) {
      res.status(404).json({ error: "Record not found." });
      return;
    }
    const companyId = String(before.company_id);
    const result = await db.execute(
      sql`UPDATE ${sql.raw(table)} SET ${sql.raw(field)} = ${value} WHERE id = ${req.params.id} AND company_id = ${companyId} RETURNING *`,
    );
    const after = safeRow((result.rows[0] ?? {}) as Record<string, unknown>);
    await db.insert(auditLogsTable).values({
      companyId,
      actorType: "platform_owner",
      actorId: context.accountId,
      action: "archived",
      entityType: req.params.entity,
      entityId: req.params.id,
      before: safeHistoryValue(before),
      after,
    });
    res.json({ row: after });
  },
);

router.delete(
  "/platform/database/:entity/:id",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    const context = await requirePlatformOwner(req);
    if (config.canDelete === false) {
      res
        .status(403)
        .json({ error: "This entity is protected from platform deletion." });
      return;
    }
    if (!idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "A valid record id is required." });
      return;
    }
    if (
      req.params.entity === "users" &&
      req.params.id === context.accountId
    ) {
      res.status(409).json({ error: "Your current platform account cannot be deleted." });
      return;
    }
    const table = sql.raw(sqlIdentifier(config.table));
    const idColumn = sql.raw(sqlIdentifier("id"));
    try {
      const deleted = await db.transaction(async (tx) => {
        const beforeResult = await tx.execute(
          sql`SELECT * FROM ${table} WHERE ${idColumn} = ${req.params.id} LIMIT 1`,
        );
        const before = (beforeResult.rows[0] ?? null) as Record<
          string,
          unknown
        > | null;
        if (!before) return null;
        const result = await tx.execute(
          sql`DELETE FROM ${table} WHERE ${idColumn} = ${req.params.id} RETURNING ${idColumn}`,
        );
        return {
          before,
          deleted: result.rows.length > 0,
        };
      });
      if (!deleted) {
        res.status(404).json({ error: "Record not found." });
        return;
      }
      await audit(req, "database_deleted", req.params.entity, req.params.id, {
        companyId: deleted.before.company_id ?? null,
        deletedColumns: config.columns,
      });
      res.sendStatus(204);
    } catch (cause) {
      const code =
        typeof cause === "object" &&
        cause !== null &&
        "code" in cause &&
        typeof cause.code === "string"
          ? cause.code
          : "";
      if (
        code === "23503" ||
        (cause instanceof Error &&
          /foreign key|violates/i.test(cause.message))
      ) {
        res.status(409).json({
          error:
            "This record cannot be deleted while related records still reference it.",
        });
        return;
      }
      throw cause;
    }
  },
);

router.patch("/platform/account", async (req, res): Promise<void> => {
  const context = await requirePlatformOwner(req);
  const parsed = selfAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid account settings." });
    return;
  }
  const account = await loadAuthenticatedAccount(req);
  if (!account) {
    res.status(401).json({ error: "A signed-in account is required." });
    return;
  }
  if (
    parsed.data.newPassword &&
    (!parsed.data.currentPassword ||
      !verifyPassword(parsed.data.currentPassword, account.passwordHash))
  ) {
    res
      .status(400)
      .json({ error: "The current password is required and must be correct." });
    return;
  }
  if (parsed.data.username && parsed.data.username !== account.username) {
    const existing = await db.execute(
      sql`SELECT id FROM var_hr_user_accounts WHERE username = ${parsed.data.username} AND id <> ${context.accountId} LIMIT 1`,
    );
    if (existing.rows.length) {
      res.status(409).json({ error: "That login username is already in use." });
      return;
    }
  }
  const [updated] = await db
    .update(userAccountsTable)
    .set({
      ...(parsed.data.fullName !== undefined
        ? { fullName: parsed.data.fullName }
        : {}),
      ...(parsed.data.username !== undefined
        ? { username: parsed.data.username, primaryPhone: parsed.data.username }
        : {}),
      ...(parsed.data.newPassword
        ? { passwordHash: hashPassword(parsed.data.newPassword) }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(userAccountsTable.id, context.accountId))
    .returning();
  await audit(
    req,
    parsed.data.newPassword
      ? "platform_account_password_changed"
      : "platform_account_updated",
    "account",
    context.accountId,
    {
      fields: Object.keys(parsed.data).filter(
        (key) => !key.toLowerCase().includes("password"),
      ),
    },
  );
  res.json({
    account: {
      id: updated.id,
      username: updated.username,
      fullName: updated.fullName,
      primaryPhone: updated.primaryPhone,
    },
  });
});

export default router;
