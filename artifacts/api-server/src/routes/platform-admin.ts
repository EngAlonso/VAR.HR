// @ts-nocheck
import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  auditLogsTable,
  branchesTable,
  companiesTable,
  db,
  departmentsTable,
  emptyPlatformSocialLinks,
  employeesTable,
  employeeScheduleAssignmentsTable,
  leaveBalanceTransactionsTable,
  leaveBalancesTable,
  authAuditEventsTable,
  backupSchedulerStatusTable,
  platformSettingsTable,
  type PlatformSocialLinks,
  userAccountsTable,
  workSchedulesTable,
} from "@workspace/db";
import { UpdatePlatformSiteSettingsBody } from "@workspace/api-zod";
import {
  hashPassword,
  loadAuthenticatedAccount,
  verifyPassword,
  writeAuthAudit,
} from "../lib/auth";
import {
  calculateAnnualLeaveSupportAdjustmentAmounts,
} from "../lib/annual-leave-balance.mjs";
import { requirePlatformOwner } from "../lib/tenant-context";
import { z } from "zod";
import {
  ensureLeaveAccruals,
  refreshPlatformSupportPayroll,
  refreshPlatformSupportSchedule,
} from "./var-hr";

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
      "name_en",
      "description",
      "manager_id",
      "default_schedule_id",
      "active",
      "created_at",
    ],
    editable: ["name"],
    supportEditable: ["name", "name_en", "description", "manager_id", "active"],
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
      "pay_basis",
      "work_days_per_month",
      "working_hours",
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
      "first_name_en",
      "last_name_en",
      "phone",
      "national_id",
      "biometric_code",
      "working_hours",
      "pay_basis",
      "work_days_per_month",
      "salary",
      "joined_on",
      "department_id",
      "branch_id",
      "status",
      "role",
      "location_attendance_enabled",
      "automatic_annual_leave_eligible",
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
      "cycle_id",
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
  payroll_cycles: {
    table: "var_hr_payroll_cycles",
    label: "Payroll cycles",
    columns: [
      "id",
      "company_id",
      "name",
      "start_day",
      "pay_day",
      "active",
      "created_at",
      "updated_at",
    ],
    editable: ["name", "start_day", "pay_day", "active"],
    hasUpdatedAt: true,
    companyColumn: "company_id",
    orderColumn: "created_at",
  },
  employee_payroll_cycle_assignments: {
    table: "var_hr_employee_payroll_cycle_assignments",
    label: "Employee payroll cycle assignments",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "cycle_id",
      "effective_from",
      "effective_to",
      "created_at",
    ],
    editable: ["cycle_id", "effective_from", "effective_to"],
    companyColumn: "company_id",
    orderColumn: "effective_from",
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
  leave_balances: {
    table: "var_hr_leave_balances",
    label: "Annual leave balances",
    columns: [
      "id",
      "company_id",
      "employee_id",
      "type",
      "allocated",
      "used",
      "pending",
    ],
    editable: [],
    canDelete: false,
    companyColumn: "company_id",
    orderColumn: "employee_id",
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
    canDelete: false,
  },
};

const idSchema = z.string().uuid();
const logoVariantSchema = z.enum(["square", "short", "horizontal", "arabic"]);
const siteSettingsSchema = UpdatePlatformSiteSettingsBody;
const socialLinkUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || isSafeSocialLink(value));
const whatsAppPhoneSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || Boolean(normalizeWhatsAppPhone(value)));
const socialLinksSchema = z
  .object({
    facebook: socialLinkUrlSchema,
    instagram: socialLinkUrlSchema,
    linkedin: socialLinkUrlSchema,
    x: socialLinkUrlSchema,
    youtube: socialLinkUrlSchema,
    tiktok: socialLinkUrlSchema,
    whatsapp: whatsAppPhoneSchema,
  })
  .strict();

function isSafeSocialLink(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function normalizeWhatsAppPhone(value: unknown): string {
  if (typeof value !== "string") return "";

  let candidate = value.trim();
  if (!candidate) return "";

  if (/^https?:\/\//i.test(candidate)) {
    try {
      const url = new URL(candidate);
      if (url.protocol !== "https:" || url.username || url.password) return "";

      if (url.hostname === "wa.me") {
        candidate = decodeURIComponent(url.pathname).replace(/^\/+/, "");
      } else if (
        (url.hostname === "api.whatsapp.com" ||
          url.hostname === "web.whatsapp.com") &&
        url.pathname === "/send"
      ) {
        candidate = url.searchParams.get("phone") ?? "";
      } else {
        return "";
      }
    } catch {
      return "";
    }
  }

  if (!/^\+?[\d\s().-]+$/.test(candidate)) return "";
  const digits = candidate.replace(/\D/g, "");
  const normalizedInput = digits.startsWith("00") ? digits.slice(2) : digits;
  if (/^01[0125]\d{8}$/.test(normalizedInput)) {
    return `20${normalizedInput.slice(1)}`;
  }
  if (/^201[0125]\d{8}$/.test(normalizedInput)) return normalizedInput;
  return /^\d{8,15}$/.test(normalizedInput) &&
    !normalizedInput.startsWith("0")
    ? normalizedInput
    : "";
}

function normalizePlatformSocialLinks(value: unknown): PlatformSocialLinks {
  const stored =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const normalize = (key: keyof PlatformSocialLinks): string => {
    const candidate = typeof stored[key] === "string" ? stored[key].trim() : "";
    return candidate && isSafeSocialLink(candidate) ? candidate : "";
  };

  return {
    facebook: normalize("facebook"),
    instagram: normalize("instagram"),
    linkedin: normalize("linkedin"),
    x: normalize("x"),
    youtube: normalize("youtube"),
    tiktok: normalize("tiktok"),
    whatsapp: normalizeWhatsAppPhone(stored.whatsapp),
  };
}

const backupScheduleSchema = z
  .object({
    platformBackupRunsPerDay: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(4),
    ]),
    companyBackupIntervalMinutes: z.union([
      z.literal(0),
      z.literal(1440),
      z.literal(10080),
    ]),
  })
  .strict();
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
const supportEditSchema = z
  .object({
    values: z.record(z.string(), z.unknown()),
    companyId: idSchema,
    reason: z.string().trim().min(10).max(500),
  })
  .strict();
const supportDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid calendar date.");
const employeeSupportEditSchema = supportEditSchema
  .extend({
    scheduleAssignment: z
      .object({
        scheduleId: idSchema,
        effectiveFrom: supportDateSchema,
        effectiveTo: supportDateSchema.nullable(),
      })
      .optional(),
  })
  .strict();
const platformLeaveBalanceSupportSchema = z
  .object({
    companyId: idSchema,
    allocated: z
      .number()
      .finite()
      .min(0)
      .max(9999.99)
      .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8),
    used: z
      .number()
      .finite()
      .min(0)
      .max(9999.99)
      .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8),
    reason: z.string().trim().min(10).max(500),
  })
  .strict();
const supportFields: Record<string, string[]> = {
  employees: [
    "employee_number",
    "first_name",
    "last_name",
    "first_name_en",
    "last_name_en",
    "phone",
    "national_id",
    "biometric_code",
    "working_hours",
    "pay_basis",
    "salary",
    "joined_on",
    "department_id",
    "branch_id",
    "status",
    "role",
    "work_days_per_month",
    "location_attendance_enabled",
    "automatic_annual_leave_eligible",
  ],
  departments: ["name", "name_en", "description", "manager_id", "active"],
  branches: [
    "name",
    "city",
    "gps_enabled",
    "latitude",
    "longitude",
    "radius_meters",
  ],
};
const databaseBooleanFields = new Set([
  "active",
  "gps_enabled",
  "location_attendance_enabled",
  "automatic_annual_leave_eligible",
  "overtime_eligible",
  "recurring",
]);
const databaseNumericFields = new Set([
  "latitude",
  "longitude",
  "radius_meters",
  "required_hours",
  "grace_minutes",
  "worked_hours",
  "overtime_hours",
  "salary",
  "work_days_per_month",
  "working_hours",
]);
const safeHistoryValue = (value: unknown): unknown => {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(safeHistoryValue);
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (
      /password|token|secret|session|api.?key|credential|national.?id|biometric.?code/i.test(
        key,
      )
    ) {
      continue;
    }
    result[key] = safeHistoryValue(item);
  }
  return result;
};

function configFor(name: string): EntityConfig {
  const config = entities[name];
  if (!config) throw new Error("Unknown administration entity.");
  return config;
}

function databaseOrderBy(entity: string, config: EntityConfig): string {
  if (entity === "employees") {
    const employeeNumber = sqlIdentifier("employee_number");
    return `regexp_replace(${employeeNumber}, '[^0-9]', '', 'g')::numeric ASC, ${employeeNumber} ASC, ${sqlIdentifier("id")} ASC`;
  }
  return `${sqlIdentifier(config.orderColumn ?? "created_at")} DESC NULLS LAST`;
}

function sqlIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function sqlStringLiteral(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
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

async function loadPlatformSettings() {
  const [settings] = await db
    .select()
    .from(platformSettingsTable)
    .where(eq(platformSettingsTable.id, "default"))
    .limit(1);
  return {
    siteName: settings?.siteName || "VAR HR",
    logoVariant: logoVariantSchema.safeParse(settings?.logoVariant).success
      ? settings.logoVariant
      : "horizontal",
    socialLinks: normalizePlatformSocialLinks(settings?.socialLinks),
  };
}

router.get("/platform/site-settings", async (_req, res): Promise<void> => {
  res.json(await loadPlatformSettings());
});

router.patch("/platform/site-settings", async (req, res): Promise<void> => {
  const context = await requirePlatformOwner(req);
  const parsed = siteSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid site branding settings." });
    return;
  }
  const socialLinksResult =
    parsed.data.socialLinks === undefined
      ? undefined
      : socialLinksSchema.safeParse(parsed.data.socialLinks);
  if (socialLinksResult && !socialLinksResult.success) {
    res.status(400).json({
      error:
        "Social links must be secure HTTPS URLs. WhatsApp must be an international phone number.",
    });
    return;
  }
  const socialLinks = socialLinksResult?.success
    ? ({
        ...socialLinksResult.data,
        whatsapp: normalizeWhatsAppPhone(socialLinksResult.data.whatsapp),
      } as PlatformSocialLinks)
    : undefined;
  await db
    .insert(platformSettingsTable)
    .values({
      id: "default",
      siteName: parsed.data.siteName,
      logoVariant: parsed.data.logoVariant,
      socialLinks: socialLinks ?? emptyPlatformSocialLinks,
    })
    .onConflictDoUpdate({
      target: platformSettingsTable.id,
      set: {
        siteName: parsed.data.siteName,
        logoVariant: parsed.data.logoVariant,
        ...(socialLinks ? { socialLinks } : {}),
        updatedAt: new Date(),
      },
    });
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: null,
    action: "platform_site_settings_updated",
    entityType: "platform_settings",
    entityId: "default",
    metadata: {
      fields: ["siteName", "logoVariant", ...(socialLinks ? ["socialLinks"] : [])],
    },
  });
  res.json(await loadPlatformSettings());
});

async function loadBackupSchedule() {
  const [settings] = await db
    .select()
    .from(platformSettingsTable)
    .where(eq(platformSettingsTable.id, "default"))
    .limit(1);
  const [latestRun] = await db
    .select()
    .from(backupSchedulerStatusTable)
    .where(eq(backupSchedulerStatusTable.targetKey, "latest-run"))
    .limit(1);
  const savedTargets = await db
    .select()
    .from(backupSchedulerStatusTable)
    .where(inArray(backupSchedulerStatusTable.targetType, ["platform", "company"]));
  const companies = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      nameEn: companiesTable.nameEn,
    })
    .from(companiesTable);
  const savedTargetByKey = new Map(
    savedTargets.map((target) => [target.targetKey, target]),
  );
  const serializeTarget = (
    targetType: "platform" | "company",
    company: { id: string; name: string; nameEn: string } | null,
    scheduleEnabled: boolean,
  ) => {
    const targetKey = company ? `company:${company.id}` : "platform";
    const target = savedTargetByKey.get(targetKey);
    return {
      targetType,
      companyId: company?.id ?? null,
      companyName: company?.name ?? null,
      companyNameEn: company?.nameEn ?? null,
      scheduleEnabled,
      source: target?.source ?? null,
      status: target?.status ?? (scheduleEnabled ? "not_attempted" : "disabled"),
      reason: target?.reason ?? null,
      startedAt: target?.startedAt ?? null,
      completedAt: target?.completedAt ?? null,
      backupsCreated: target?.backupsCreated ?? 0,
      failureCount: target?.failureCount ?? 0,
      driveFailed: target?.driveFailed ?? 0,
      errorMessage: target?.errorMessage ?? null,
    };
  };
  const serializedCompanies = companies
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((company) =>
      serializeTarget(
        "company",
        company,
        (settings?.companyBackupIntervalMinutes ?? 0) > 0,
      ),
    );
  const storedPlatformRunsPerDay = settings?.platformBackupRunsPerDay ?? 0;
  const platformBackupRunsPerDay =
    storedPlatformRunsPerDay === 1 ||
    storedPlatformRunsPerDay === 2 ||
    storedPlatformRunsPerDay === 4
      ? storedPlatformRunsPerDay
      : storedPlatformRunsPerDay > 0
        ? 4
        : 0;
  const platformScheduleEnabled = platformBackupRunsPerDay > 0;
  return {
    platformBackupRunsPerDay,
    companyBackupIntervalMinutes:
      settings?.companyBackupIntervalMinutes ?? 0,
    schedulerReady:
      process.env.VERCEL !== "1" || Boolean(process.env.CRON_SECRET),
    schedulerStatus: {
      latestRun: latestRun
        ? {
            startedAt: latestRun.startedAt,
            completedAt: latestRun.completedAt,
            source: latestRun.source,
            status: latestRun.status,
            reason: latestRun.reason,
            platformCreated: latestRun.platformCreated,
            companyCreated: latestRun.companyCreated,
            failureCount: latestRun.failureCount,
            driveUploaded: latestRun.driveUploaded,
            driveFailed: latestRun.driveFailed,
            drivePending: latestRun.drivePending,
            errorMessage: latestRun.errorMessage,
          }
        : null,
      targets: [
        serializeTarget(
          "platform",
          null,
          platformScheduleEnabled,
        ),
        ...serializedCompanies,
      ],
    },
  };
}

router.get("/platform/backup-schedule", async (req, res): Promise<void> => {
  await requirePlatformOwner(req);
  res.json(await loadBackupSchedule());
});

router.patch("/platform/backup-schedule", async (req, res): Promise<void> => {
  const context = await requirePlatformOwner(req);
  const parsed = backupScheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error:
        "Platform backups must run 1, 2, or 4 times daily, or be off; company backups must be off, daily, or weekly.",
    });
    return;
  }

  await db
    .insert(platformSettingsTable)
    .values({
      id: "default",
      platformBackupRunsPerDay: parsed.data.platformBackupRunsPerDay,
      companyBackupIntervalMinutes:
        parsed.data.companyBackupIntervalMinutes,
    })
    .onConflictDoUpdate({
      target: platformSettingsTable.id,
      set: {
        platformBackupRunsPerDay: parsed.data.platformBackupRunsPerDay,
        companyBackupIntervalMinutes:
          parsed.data.companyBackupIntervalMinutes,
        updatedAt: new Date(),
      },
    });

  await writeAuthAudit({
    accountId: context.accountId,
    companyId: null,
    action: "platform_backup_schedule_updated",
    entityType: "platform_settings",
    entityId: "default",
    metadata: {
      platformBackupRunsPerDay: parsed.data.platformBackupRunsPerDay,
      companyBackupIntervalMinutes:
        parsed.data.companyBackupIntervalMinutes,
    },
  });
  res.json(await loadBackupSchedule());
});

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

router.patch(
  "/platform/leave-balances/:id/support",
  async (req, res): Promise<void> => {
    const context = await requirePlatformOwner(req);
    if (!idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "A valid leave balance id is required." });
      return;
    }
    const parsed = platformLeaveBalanceSupportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Provide a valid total, used days, company, and reason.",
      });
      return;
    }

    const roundDays = (value: number) => Number(value.toFixed(2));
    const result = await db.transaction(async (tx) => {
      const [before] = await tx
        .select()
        .from(leaveBalancesTable)
        .where(
          and(
            eq(leaveBalancesTable.id, req.params.id),
            eq(leaveBalancesTable.companyId, parsed.data.companyId),
          ),
        )
        .limit(1)
        .for("update");
      if (!before) return { kind: "not_found" as const };
      if (!["annual", "annual leave"].includes(before.type.trim().toLowerCase())) {
        return { kind: "not_annual" as const };
      }

      const previousAllocated = roundDays(Number(before.allocated));
      const previousUsed = roundDays(Number(before.used));
      const allocated = roundDays(parsed.data.allocated);
      const used = roundDays(parsed.data.used);
      const pending = roundDays(Number(before.pending));
      if (previousAllocated === allocated && previousUsed === used) {
        return { kind: "unchanged" as const };
      }

      const originalRemaining = roundDays(previousAllocated - previousUsed - pending);
      const afterRemaining = roundDays(allocated - used - pending);
      if (afterRemaining < 0) return { kind: "total_too_small" as const };

      const { allocationAdjustment, usageCorrection } =
        calculateAnnualLeaveSupportAdjustmentAmounts({
          previousAllocated,
          allocated,
          previousUsed,
          used,
        });
      const allocationFirst = allocationAdjustment >= 0;
      const allocationBeforeBalance = allocationFirst
        ? originalRemaining
        : roundDays(originalRemaining + usageCorrection);
      const allocationAfterBalance = roundDays(
        allocationBeforeBalance + allocationAdjustment,
      );
      const usageBeforeBalance = allocationFirst
        ? allocationAfterBalance
        : originalRemaining;
      const usageAfterBalance = roundDays(
        usageBeforeBalance + usageCorrection,
      );
      const changedFields = [
        ...(previousAllocated !== allocated ? ["allocated"] : []),
        ...(previousUsed !== used ? ["used"] : []),
      ];
      const [updated] = await tx
        .update(leaveBalancesTable)
        .set({ allocated, used })
        .where(
          and(
            eq(leaveBalancesTable.id, before.id),
            eq(leaveBalancesTable.companyId, parsed.data.companyId),
          ),
        )
        .returning();
      if (!updated) return { kind: "not_found" as const };

      const allocationEvent = {
        amount: allocationAdjustment,
        transactionType: "manual_adjustment",
        beforeBalance: allocationBeforeBalance,
        afterBalance: allocationAfterBalance,
      };
      const usageEvent = {
        amount: usageCorrection,
        transactionType: "support_usage_correction",
        beforeBalance: usageBeforeBalance,
        afterBalance: usageAfterBalance,
      };
      const supportEvents = allocationFirst
        ? [allocationEvent, usageEvent]
        : [usageEvent, allocationEvent];
      for (const event of supportEvents) {
        if (event.amount === 0) continue;
        await tx.insert(leaveBalanceTransactionsTable).values({
          companyId: before.companyId,
          employeeId: before.employeeId,
          leaveType: before.type,
          ...event,
          actorId: context.accountId,
          reason: parsed.data.reason,
        });
      }
      await tx.insert(auditLogsTable).values({
        companyId: before.companyId,
        actorType: "platform_owner",
        actorId: context.accountId,
        action: "support_updated",
        entityType: "leave_balance",
        entityId: before.id,
        before: {
          allocated: previousAllocated,
          used: previousUsed,
          pending,
          remaining: originalRemaining,
        },
        after: {
          allocated,
          used,
          pending,
          remaining: afterRemaining,
          reason: parsed.data.reason,
        },
      });
      return {
        kind: "updated" as const,
        balance: {
          id: updated.id,
          companyId: updated.companyId,
          employeeId: updated.employeeId,
          type: updated.type,
          allocated: roundDays(Number(updated.allocated)),
          used: roundDays(Number(updated.used)),
          pending: roundDays(Number(updated.pending)),
          remaining: afterRemaining,
        },
        previousAllocated,
        previousUsed,
        amount: roundDays(afterRemaining - originalRemaining),
        allocationAdjustment,
        usageCorrection,
        changedFields,
      };
    });

    if (result.kind === "not_found") {
      res.status(404).json({ error: "Leave balance not found in that company." });
      return;
    }
    if (result.kind === "not_annual") {
      res.status(400).json({ error: "Only annual leave balances can be edited here." });
      return;
    }
    if (result.kind === "unchanged") {
      res.status(400).json({ error: "The leave balance has not changed." });
      return;
    }
    if (result.kind === "total_too_small") {
      res.status(400).json({
        error: "The total must cover used and pending leave days.",
      });
      return;
    }
    await ensureLeaveAccruals(parsed.data.companyId);
    const [refreshedBalance] = await db
      .select()
      .from(leaveBalancesTable)
      .where(
        and(
          eq(leaveBalancesTable.id, result.balance.id),
          eq(leaveBalancesTable.companyId, parsed.data.companyId),
        ),
      )
      .limit(1);
    if (refreshedBalance) {
      result.balance.allocated = roundDays(Number(refreshedBalance.allocated));
      result.balance.used = roundDays(Number(refreshedBalance.used));
      result.balance.pending = roundDays(Number(refreshedBalance.pending));
      result.balance.remaining = roundDays(
        Number(refreshedBalance.allocated) -
          Number(refreshedBalance.used) -
          Number(refreshedBalance.pending),
      );
    }
    await writeAuthAudit({
      accountId: context.accountId,
      companyId: parsed.data.companyId,
      action: "database_support_updated",
      entityType: "database:leave_balances",
      entityId: result.balance.id,
      metadata: {
        fields: result.changedFields,
        previousAllocated: result.previousAllocated,
        previousUsed: result.previousUsed,
        allocated: result.balance.allocated,
        used: result.balance.used,
        pending: result.balance.pending,
        remaining: result.balance.remaining,
        amount: result.amount,
        allocationAdjustment: result.allocationAdjustment,
        usageCorrection: result.usageCorrection,
        reason: parsed.data.reason,
      },
    });
    res.json({ balance: result.balance });
  },
);

router.get("/platform/database/:entity", async (req, res): Promise<void> => {
  const config = configFor(req.params.entity);
  await requirePlatformOwner(req);
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const companyId =
    typeof req.query.companyId === "string" ? req.query.companyId.trim() : "";
  const missingReferenceWorkdays =
    req.query.missingReferenceWorkdays === "true";
  if (companyId && !idSchema.safeParse(companyId).success) {
    res.status(400).json({ error: "A valid company filter is required." });
    return;
  }
  if (missingReferenceWorkdays && req.params.entity !== "employees") {
    res.status(400).json({
      error: "The missing-workdays filter is only available for employees.",
    });
    return;
  }
  const columns = config.columns.map(sqlIdentifier).join(", ");
  const predicates = [
    ...(companyId && config.companyColumn
      ? [
          `${sqlIdentifier(config.companyColumn)} = ${sqlStringLiteral(companyId)}`,
        ]
      : []),
    ...(missingReferenceWorkdays
      ? ['"work_days_per_month" IS NULL']
      : []),
    ...(search
      ? [
          req.params.entity === "leave_balances"
            ? `(to_jsonb(${sqlIdentifier(config.table)})::text ILIKE ${sqlStringLiteral(`%${search}%`)} OR EXISTS (SELECT 1 FROM "var_hr_employees" employee WHERE employee.id = "var_hr_leave_balances".employee_id AND concat_ws(' ', employee.first_name, employee.last_name) ILIKE ${sqlStringLiteral(`%${search}%`)}))`
            : `to_jsonb(${sqlIdentifier(config.table)})::text ILIKE ${sqlStringLiteral(`%${search}%`)}`,
        ]
      : []),
  ];
  const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
  const query = sql.raw(
    `SELECT ${columns} FROM ${sqlIdentifier(config.table)}${where} ORDER BY ${databaseOrderBy(req.params.entity, config)} LIMIT ${limit} OFFSET ${offset}`,
  );
  const result = await db.execute(query);
  const companies = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      nameEn: companiesTable.nameEn,
    })
    .from(companiesTable);
  const companyNames = new Map(
    companies.map((company) => [
      company.id,
      { name: company.name, nameEn: company.nameEn },
    ]),
  );
  const rawRows = result.rows as Record<string, unknown>[];
  const employeeIds = rawRows
    .map((row) => String(row.employee_id ?? ""))
    .filter((employeeId) => idSchema.safeParse(employeeId).success);
  const employeeNames =
    req.params.entity === "leave_balances" && employeeIds.length
      ? new Map(
          (
            await db
              .select({
                id: employeesTable.id,
                firstName: employeesTable.firstName,
                lastName: employeesTable.lastName,
                firstNameEn: employeesTable.firstNameEn,
                lastNameEn: employeesTable.lastNameEn,
              })
              .from(employeesTable)
              .where(inArray(employeesTable.id, employeeIds))
          ).map((employee) => [
            employee.id,
            {
              arabic: `${employee.firstName} ${employee.lastName}`.trim(),
              english: `${employee.firstNameEn} ${employee.lastNameEn}`.trim(),
            },
          ]),
        )
      : new Map<string, { arabic: string; english: string }>();
  const rows = rawRows.map((row) => ({
    ...safeRow(row),
    ...(req.params.entity === "leave_balances"
      ? {
          employee_name:
            employeeNames.get(String(row.employee_id ?? ""))?.arabic ?? "",
          employee_name_en:
            employeeNames.get(String(row.employee_id ?? ""))?.english ?? "",
          remaining:
            Number(row.allocated ?? 0) -
            Number(row.used ?? 0) -
            Number(row.pending ?? 0),
        }
      : {}),
    ...(req.params.entity !== "companies"
      ? {
          company_name:
            companyNames.get(String(row.company_id ?? ""))?.name ??
            "Unknown company",
          ...(req.params.entity === "backups"
            ? {
                company_name_en:
                  companyNames.get(String(row.company_id ?? ""))?.nameEn ?? "",
              }
            : {}),
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
        : req.params.entity === "leave_balances"
          ? [
              ...config.columns,
              "employee_name",
              "employee_name_en",
              "remaining",
              "company_name",
            ]
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
        ? ` WHERE ${sqlIdentifier(config.companyColumn)} = ${sqlStringLiteral(companyId)}`
        : "";
    const result = await db.execute(
      sql.raw(
          `SELECT ${config.columns.map(sqlIdentifier).join(", ")} FROM ${sqlIdentifier(config.table)}${where} ORDER BY ${databaseOrderBy(req.params.entity, config)} LIMIT 5000`,
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

router.get(
  "/platform/database/employees/:id/support",
  async (req, res): Promise<void> => {
    const context = await requirePlatformOwner(req);
    const companyId =
      typeof req.query.companyId === "string" ? req.query.companyId.trim() : "";
    if (
      !idSchema.safeParse(req.params.id).success ||
      !idSchema.safeParse(companyId).success
    ) {
      res.status(400).json({ error: "A valid employee and company are required." });
      return;
    }
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, req.params.id),
          eq(employeesTable.companyId, companyId),
        ),
      )
      .limit(1);
    if (!employee) {
      res.status(404).json({ error: "Employee not found in the selected company." });
      return;
    }
    const [company] = await db
      .select({
        id: companiesTable.id,
        timezone: companiesTable.timezone,
        currency: companiesTable.currency,
        defaultScheduleId: companiesTable.defaultScheduleId,
      })
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);
    if (!company) {
      res.status(404).json({ error: "Company not found." });
      return;
    }
    const [departments, branches, schedules, assignments] = await Promise.all([
      db
        .select({
          id: departmentsTable.id,
          name: departmentsTable.name,
          nameEn: departmentsTable.nameEn,
        })
        .from(departmentsTable)
        .where(eq(departmentsTable.companyId, companyId))
        .orderBy(departmentsTable.name),
      db
        .select({
          id: branchesTable.id,
          name: branchesTable.name,
          nameEn: branchesTable.nameEn,
        })
        .from(branchesTable)
        .where(eq(branchesTable.companyId, companyId))
        .orderBy(branchesTable.name),
      db
        .select({
          id: workSchedulesTable.id,
          name: workSchedulesTable.name,
          nameAr: workSchedulesTable.nameAr,
          nameEn: workSchedulesTable.nameEn,
          startTime: workSchedulesTable.startTime,
          endTime: workSchedulesTable.endTime,
          active: workSchedulesTable.active,
        })
        .from(workSchedulesTable)
        .where(eq(workSchedulesTable.companyId, companyId))
        .orderBy(workSchedulesTable.name),
      db
        .select()
        .from(employeeScheduleAssignmentsTable)
        .where(
          and(
            eq(employeeScheduleAssignmentsTable.companyId, companyId),
            eq(employeeScheduleAssignmentsTable.employeeId, employee.id),
          ),
        )
        .orderBy(desc(employeeScheduleAssignmentsTable.effectiveFrom)),
    ]);
    const dateParts = new Intl.DateTimeFormat("en", {
      timeZone: company.timezone || "Africa/Cairo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .reduce<Record<string, string>>((parts, part) => {
        if (part.type !== "literal") parts[part.type] = part.value;
        return parts;
      }, {});
    const today = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    const currentAssignment = assignments.find(
      (assignment) =>
        assignment.effectiveFrom <= today &&
        (assignment.effectiveTo === null || assignment.effectiveTo >= today),
    );
    const availableSchedules = schedules.filter(
      (schedule) =>
        schedule.active ||
        schedule.id === currentAssignment?.scheduleId ||
        schedule.id === company.defaultScheduleId,
    );
    const currentScheduleId =
      currentAssignment?.scheduleId ??
      (availableSchedules.some(
        (schedule) =>
          schedule.id === company.defaultScheduleId && schedule.active,
      )
        ? company.defaultScheduleId
        : "");
    await writeAuthAudit({
      accountId: context.accountId,
      companyId,
      action: "database_support_viewed",
      entityType: "database:employees",
      entityId: employee.id,
      metadata: { purpose: "employee_edit_form" },
    });
    res.json({
      company: { currency: company.currency || "EGP" },
      today,
      values: {
        employee_number: employee.employeeNumber,
        first_name: employee.firstName,
        last_name: employee.lastName,
        first_name_en: employee.firstNameEn,
        last_name_en: employee.lastNameEn,
        phone: employee.phone ?? "",
        national_id: employee.nationalId ?? "",
        biometric_code: employee.biometricCode ?? "",
        working_hours: employee.workingHours,
        pay_basis: employee.payBasis,
        work_days_per_month: employee.workDaysPerMonth ?? "",
        salary: employee.salary,
        joined_on: employee.joinedOn,
        department_id: employee.departmentId ?? "",
        branch_id: employee.branchId,
        role: employee.role,
        status: employee.status,
        location_attendance_enabled: employee.locationAttendanceEnabled,
        automatic_annual_leave_eligible:
          employee.automaticAnnualLeaveEligible,
      },
      currentScheduleId,
      scheduleAssignment: currentAssignment
        ? {
            scheduleId: currentAssignment.scheduleId,
            effectiveFrom: currentAssignment.effectiveFrom,
            effectiveTo: currentAssignment.effectiveTo,
          }
        : null,
      departments,
      branches,
      schedules: availableSchedules,
    });
  },
);

router.patch(
  "/platform/database/:entity/:id",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    const context = await requirePlatformOwner(req);
    if (supportFields[req.params.entity]?.length) {
      res.status(403).json({
        error: "Use the restricted support editor for this entity.",
      });
      return;
    }
    if (!config.editable.length) {
      res.status(403).json({ error: "This entity does not support platform editing." });
      return;
    }
    if (!idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "A valid record id is required." });
      return;
    }
    const parsed =
      req.params.entity === "employees"
        ? employeeSupportEditSchema.safeParse(req.body)
        : supportEditSchema.safeParse(req.body);
    if (!parsed.success || !Object.keys(parsed.data.values).length) {
      res.status(400).json({
        error: "Provide fields, a company scope, and a support reason.",
      });
      return;
    }
    const keys = Object.keys(parsed.data.values);
    if (keys.some((key) => !config.editable.includes(key))) {
      res.status(400).json({ error: "One or more fields are not allowed." });
      return;
    }
    const normalizedValues: Record<string, unknown> = {};
    for (const key of keys) {
      const value = parsed.data.values[key];
      if (databaseBooleanFields.has(key)) {
        if (typeof value === "boolean") {
          normalizedValues[key] = value;
        } else if (value === "true" || value === "false") {
          normalizedValues[key] = value === "true";
        } else {
          res.status(400).json({ error: `${key} must be true or false.` });
          return;
        }
      } else if (databaseNumericFields.has(key)) {
        if (value === "" || value === null) {
          normalizedValues[key] = null;
        } else {
          const numericValue =
            typeof value === "number" ? value : Number(value);
          if (!Number.isFinite(numericValue)) {
            res.status(400).json({ error: `${key} must be a valid number.` });
            return;
          }
          normalizedValues[key] = numericValue;
        }
      } else if (
        value === null ||
        typeof value === "string" ||
        typeof value === "number"
      ) {
        normalizedValues[key] = value;
      } else {
        res.status(400).json({ error: `${key} has an invalid value.` });
        return;
      }
    }
    const table = sql.raw(sqlIdentifier(config.table));
    const idColumn = sql.raw(sqlIdentifier("id"));
    const [before] = (
      await db.execute(
        sql`SELECT * FROM ${table} WHERE ${idColumn} = ${req.params.id} LIMIT 1`,
      )
    ).rows as Record<string, unknown>[];
    if (!before) {
      res.status(404).json({ error: "Record not found." });
      return;
    }
    if (
      !config.companyColumn ||
      String(before[config.companyColumn] ?? "") !== parsed.data.companyId
    ) {
      res.status(404).json({ error: "Record not found in the selected company." });
      return;
    }
    const setParts = keys.map(
      (key) =>
        sql`${sql.raw(sqlIdentifier(key))} = ${normalizedValues[key]}`,
    );
    if (config.hasUpdatedAt) setParts.push(sql`updated_at = now()`);
    const companyColumn = sql.raw(sqlIdentifier(config.companyColumn));
    const result = await db.execute(
      sql`UPDATE ${table} SET ${sql.join(setParts, sql`, `)} WHERE ${idColumn} = ${req.params.id} AND ${companyColumn} = ${parsed.data.companyId} RETURNING ${sql.raw(config.columns.map(sqlIdentifier).join(", "))}`,
    );
    if (!result.rows[0]) {
      res.status(404).json({ error: "Record not found in the selected company." });
      return;
    }
    const after = safeRow((result.rows[0] ?? {}) as Record<string, unknown>);
    const companyId = parsed.data.companyId;
    if (companyId) {
      await db.insert(auditLogsTable).values({
        companyId,
        actorType: "platform_owner",
        actorId: context.accountId,
        action: "updated",
        entityType: req.params.entity,
        entityId: req.params.id,
        before: safeHistoryValue(before),
        after,
      });
    }
    await writeAuthAudit({
      accountId: context.accountId,
      companyId,
      action: "database_updated",
      entityType: `database:${req.params.entity}`,
      entityId: req.params.id,
      metadata: {
        fields: keys,
        reason: parsed.data.reason,
        actorRole: "platform_owner",
      },
    });
    res.json({ row: after });
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
    const parsed = supportEditSchema.safeParse(req.body);
    const allowed = supportFields[req.params.entity];
    if (
      !parsed.success ||
      !allowed ||
      (!Object.keys(parsed.data.values).length &&
        !(req.params.entity === "employees" && parsed.data.scheduleAssignment))
    ) {
      res.status(400).json({
        error: "Provide supported fields, a company scope, and a support reason.",
      });
      return;
    }
    const keys = Object.keys(parsed.data.values);
    if (keys.some((key) => !allowed.includes(key))) {
      res.status(400).json({ error: "One or more support fields are not allowed." });
      return;
    }
    for (const key of keys) {
      const value = parsed.data.values[key];
      if (
        ["department_id", "branch_id", "manager_id"].includes(key) &&
        value !== null &&
        value !== "" &&
        (!idSchema.safeParse(value).success)
      ) {
        res.status(400).json({ error: "Referenced records must use valid ids." });
        return;
      }
      if (
        ["name", "name_ar", "name_en", "description", "employee_number", "first_name", "last_name", "email", "phone", "city", "status", "role"].includes(key) &&
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
          `SELECT * FROM ${sqlIdentifier(config.table)} WHERE ${sqlIdentifier("id")} = ${sqlStringLiteral(req.params.id)} LIMIT 1`,
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
    if (companyId !== parsed.data.companyId) {
      res.status(404).json({ error: "Record not found in the selected company." });
      return;
    }
    if (req.params.entity === "employees") {
      const employeeValues = parsed.data.values as Record<string, unknown>;
      const employeeAllowed = new Set(allowed);
      const fieldTypes: Record<string, "text" | "number" | "boolean"> = {
        employee_number: "text",
        first_name: "text",
        last_name: "text",
        first_name_en: "text",
        last_name_en: "text",
        phone: "text",
        national_id: "text",
        biometric_code: "text",
        working_hours: "number",
        pay_basis: "text",
        salary: "number",
        joined_on: "text",
        department_id: "text",
        branch_id: "text",
        status: "text",
        role: "text",
        work_days_per_month: "number",
        location_attendance_enabled: "boolean",
        automatic_annual_leave_eligible: "boolean",
      };
      const employeeKeys = Object.keys(employeeValues);
      if (employeeKeys.some((key) => !employeeAllowed.has(key))) {
        res.status(400).json({ error: "One or more employee fields are not allowed." });
        return;
      }
      const normalizedValues: Record<string, unknown> = {};
      for (const key of employeeKeys) {
        const value = employeeValues[key];
        const type = fieldTypes[key];
        if (type === "text") {
          if (value !== null && typeof value !== "string") {
            res.status(400).json({ error: `The ${key} field must be text.` });
            return;
          }
          normalizedValues[key] = value === "" ? null : value;
        } else if (type === "boolean") {
          if (typeof value === "boolean") normalizedValues[key] = value;
          else if (value === "true" || value === "false") {
            normalizedValues[key] = value === "true";
          } else {
            res.status(400).json({ error: `${key} must be true or false.` });
            return;
          }
        } else if (type === "number") {
          const number = typeof value === "number" ? value : Number(value);
          if (!Number.isFinite(number)) {
            res.status(400).json({ error: `${key} must be a valid number.` });
            return;
          }
          normalizedValues[key] = number;
        }
      }

      const current = (key: string) =>
        key in normalizedValues ? normalizedValues[key] : before[key];
      const employeeNumber = String(current("employee_number") ?? "").trim();
      const firstName = String(current("first_name") ?? "").trim();
      const lastName = String(current("last_name") ?? "").trim();
      const phone = String(current("phone") ?? "").trim();
      const joinedOn = String(current("joined_on") ?? "");
      const branchId = String(current("branch_id") ?? "");
      const salary = Number(current("salary"));
      const workingHours = Number(current("working_hours"));
      const workDays = Number(current("work_days_per_month"));
      const payBasis = String(current("pay_basis") ?? "");
      const role = String(current("role") ?? "");
      const status = String(current("status") ?? "");
      if (
        !/^[1-9][0-9]*$/.test(employeeNumber) ||
        !firstName ||
        !lastName ||
        !phone ||
        !supportDateSchema.safeParse(joinedOn).success ||
        !idSchema.safeParse(branchId).success ||
        !Number.isFinite(salary) ||
        salary < 0 ||
        !Number.isFinite(workingHours) ||
        workingHours <= 0 ||
        workingHours > 24 ||
        !Number.isInteger(workDays) ||
        workDays < 1 ||
        workDays > 31 ||
        !["monthly", "hourly"].includes(payBasis) ||
        !["employee", "manager"].includes(role) ||
        !["active", "inactive"].includes(status)
      ) {
        res.status(400).json({ error: "Employee fields are invalid or incomplete." });
        return;
      }
      const [departmentRows, branchRows] = await Promise.all([
        db
          .select({ id: departmentsTable.id })
          .from(departmentsTable)
          .where(eq(departmentsTable.companyId, companyId)),
        db
          .select({ id: branchesTable.id })
          .from(branchesTable)
          .where(eq(branchesTable.companyId, companyId)),
      ]);
      const departmentId = current("department_id");
      if (
        !branchRows.some((row) => row.id === branchId) ||
        (departmentId !== null &&
          departmentId !== undefined &&
          departmentId !== "" &&
          !departmentRows.some((row) => row.id === departmentId))
      ) {
        res.status(400).json({ error: "Employee references must belong to the selected company." });
        return;
      }
      const [duplicateNumber] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.companyId, companyId),
            eq(employeesTable.employeeNumber, employeeNumber),
            sql`${employeesTable.id} <> ${req.params.id}`,
          ),
        )
        .limit(1);
      const [duplicatePhone] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.companyId, companyId),
            eq(employeesTable.phone, phone),
            sql`${employeesTable.id} <> ${req.params.id}`,
          ),
        )
        .limit(1);
      const [linkedAccount] = await db
        .select({ id: userAccountsTable.id })
        .from(userAccountsTable)
        .where(
          and(
            eq(userAccountsTable.employeeId, req.params.id),
            eq(userAccountsTable.companyId, companyId),
            eq(userAccountsTable.accountType, "employee"),
          ),
        )
        .limit(1);
      const [usernameConflict] = linkedAccount
        ? await db
            .select({ id: userAccountsTable.id })
            .from(userAccountsTable)
            .where(
              and(
                eq(userAccountsTable.username, phone),
                sql`${userAccountsTable.id} <> ${linkedAccount.id}`,
              ),
            )
            .limit(1)
        : [];
      if (duplicateNumber || duplicatePhone || usernameConflict) {
        res.status(409).json({
          error: duplicateNumber
            ? "This employee number is already in use by this company."
            : "This phone number is already in use.",
        });
        return;
      }

      const scheduleAssignment = parsed.data.scheduleAssignment;
      let nextSchedule:
        | typeof workSchedulesTable.$inferSelect
        | undefined;
      let matchingAssignment:
        | typeof employeeScheduleAssignmentsTable.$inferSelect
        | undefined;
      if (scheduleAssignment) {
        if (payBasis !== "monthly") {
          res.status(400).json({ error: "Hourly employees cannot be assigned a fixed shift." });
          return;
        }
        if (
          scheduleAssignment.effectiveTo &&
          scheduleAssignment.effectiveTo < scheduleAssignment.effectiveFrom
        ) {
          res.status(400).json({ error: "The shift end date must not precede its start date." });
          return;
        }
        [nextSchedule] = await db
          .select()
          .from(workSchedulesTable)
          .where(
            and(
              eq(workSchedulesTable.id, scheduleAssignment.scheduleId),
              eq(workSchedulesTable.companyId, companyId),
              eq(workSchedulesTable.active, true),
            ),
          )
          .limit(1);
        if (!nextSchedule) {
          res.status(400).json({ error: "Select an active shift from this company." });
          return;
        }
        const assignments = await db
          .select()
          .from(employeeScheduleAssignmentsTable)
          .where(
            and(
              eq(employeeScheduleAssignmentsTable.companyId, companyId),
              eq(employeeScheduleAssignmentsTable.employeeId, req.params.id),
            ),
          );
        matchingAssignment = assignments.find(
          (assignment) =>
            assignment.effectiveFrom === scheduleAssignment.effectiveFrom,
        );
        const newEnd = scheduleAssignment.effectiveTo ?? "9999-12-31";
        const overlaps = assignments.some((assignment) => {
          if (matchingAssignment?.id === assignment.id) return false;
          const existingEnd = assignment.effectiveTo ?? "9999-12-31";
          return (
            assignment.effectiveFrom <= newEnd &&
            existingEnd >= scheduleAssignment.effectiveFrom
          );
        });
        if (overlaps) {
          res.status(409).json({ error: "The selected shift dates overlap another assignment." });
          return;
        }
      }

      const employeeColumnMap: Record<string, string> = {
        employee_number: "employeeNumber",
        first_name: "firstName",
        last_name: "lastName",
        first_name_en: "firstNameEn",
        last_name_en: "lastNameEn",
        phone: "phone",
        national_id: "nationalId",
        biometric_code: "biometricCode",
        working_hours: "workingHours",
        pay_basis: "payBasis",
        salary: "salary",
        joined_on: "joinedOn",
        department_id: "departmentId",
        branch_id: "branchId",
        status: "status",
        role: "role",
        work_days_per_month: "workDaysPerMonth",
        location_attendance_enabled: "locationAttendanceEnabled",
        automatic_annual_leave_eligible: "automaticAnnualLeaveEligible",
      };
      const employeeUpdate = Object.fromEntries(
        employeeKeys.map((key) => [
          employeeColumnMap[key],
          key === "employee_number" || key === "phone"
            ? String(normalizedValues[key] ?? "").trim()
            : normalizedValues[key] === null && key === "department_id"
              ? null
              : normalizedValues[key],
        ]),
      ) as Record<string, unknown>;
      const eligibilityChanged =
        "automatic_annual_leave_eligible" in normalizedValues &&
        normalizedValues.automatic_annual_leave_eligible !==
          before.automatic_annual_leave_eligible;
      if (
        eligibilityChanged &&
        normalizedValues.automatic_annual_leave_eligible === true &&
        !before.automatic_annual_leave_activated_at
      ) {
        employeeUpdate.automaticAnnualLeaveActivatedAt = new Date();
      }
      const phoneChanged = phone !== String(before.phone ?? "");
      const beforeAccount = linkedAccount;
      const [afterEmployee] = await db.transaction(async (tx) => {
        const [updatedEmployee] = await tx
          .update(employeesTable)
          .set({ ...employeeUpdate, updatedAt: new Date() })
          .where(
            and(
              eq(employeesTable.id, req.params.id),
              eq(employeesTable.companyId, companyId),
            ),
          )
          .returning();
        if (updatedEmployee && phoneChanged && beforeAccount) {
          await tx
            .update(userAccountsTable)
            .set({
              username: phone,
              primaryPhone: phone,
              fullName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
              fullNameEn: `${updatedEmployee.firstNameEn || updatedEmployee.firstName} ${updatedEmployee.lastNameEn || updatedEmployee.lastName}`,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(userAccountsTable.id, beforeAccount.id),
                eq(userAccountsTable.employeeId, req.params.id),
                eq(userAccountsTable.companyId, companyId),
                eq(userAccountsTable.accountType, "employee"),
              ),
            );
        }
        if (scheduleAssignment && nextSchedule) {
          const values = {
            scheduleId: nextSchedule.id,
            effectiveFrom: scheduleAssignment.effectiveFrom,
            effectiveTo: scheduleAssignment.effectiveTo,
          };
          if (matchingAssignment) {
            await tx
              .update(employeeScheduleAssignmentsTable)
              .set({
                scheduleId: values.scheduleId,
                effectiveTo: values.effectiveTo,
              })
              .where(eq(employeeScheduleAssignmentsTable.id, matchingAssignment.id));
          } else {
            await tx.insert(employeeScheduleAssignmentsTable).values({
              companyId,
              employeeId: req.params.id,
              ...values,
            });
          }
        }
        return [updatedEmployee];
      });
      if (!afterEmployee) {
        res.status(404).json({ error: "Employee not found in the selected company." });
        return;
      }
      const after = safeRow(afterEmployee as unknown as Record<string, unknown>);
      await db.insert(auditLogsTable).values({
        companyId,
        actorType: "platform_owner",
        actorId: context.accountId,
        action: "support_updated",
        entityType: "employees",
        entityId: req.params.id,
        before: safeHistoryValue(before),
        after,
      });
      await writeAuthAudit({
        accountId: context.accountId,
        companyId,
        action: "database_support_updated",
        entityType: "database:employees",
        entityId: req.params.id,
        metadata: {
          fields: [
            ...employeeKeys,
            ...(scheduleAssignment ? ["schedule_assignment"] : []),
          ],
          reason: parsed.data.reason,
          actorRole: "platform_owner",
        },
      });

      let payrollRefreshWarning = false;
      const compensationChanged =
        Number(before.salary) !== Number(afterEmployee.salary) ||
        Number(before.work_days_per_month) !==
          Number(afterEmployee.workDaysPerMonth) ||
        Number(before.working_hours) !== Number(afterEmployee.workingHours) ||
        before.pay_basis !== afterEmployee.payBasis;
      if (compensationChanged) {
        try {
          payrollRefreshWarning = !(await refreshPlatformSupportPayroll(
            companyId,
            context.accountId,
            req,
          ));
        } catch (error) {
          payrollRefreshWarning = true;
          req.log?.error(
            { err: error, companyId, employeeId: req.params.id },
            "Employee compensation was saved, but open payroll periods could not be refreshed",
          );
        }
      }
      if (scheduleAssignment && nextSchedule) {
        const [updatedAssignment] = await db
          .select()
          .from(employeeScheduleAssignmentsTable)
          .where(
            and(
              eq(employeeScheduleAssignmentsTable.companyId, companyId),
              eq(employeeScheduleAssignmentsTable.employeeId, req.params.id),
              eq(
                employeeScheduleAssignmentsTable.effectiveFrom,
                scheduleAssignment.effectiveFrom,
              ),
            ),
          )
          .limit(1);
        if (updatedAssignment) {
          await db.insert(auditLogsTable).values({
            companyId,
            actorType: "platform_owner",
            actorId: context.accountId,
            action: matchingAssignment ? "updated" : "created",
            entityType: "employee_schedule_assignment",
            entityId: updatedAssignment.id,
            before: matchingAssignment
              ? safeHistoryValue(matchingAssignment)
              : null,
            after: safeHistoryValue(updatedAssignment),
          });
          try {
            const refreshed = await refreshPlatformSupportSchedule(
              companyId,
              context.accountId,
              req,
              [
                {
                  employeeId: req.params.id,
                  effectiveFrom: updatedAssignment.effectiveFrom,
                  effectiveTo: updatedAssignment.effectiveTo,
                },
              ],
            );
            payrollRefreshWarning = payrollRefreshWarning || !refreshed;
          } catch (error) {
            payrollRefreshWarning = true;
            req.log?.error(
              { err: error, companyId, employeeId: req.params.id },
              "Employee shift was saved, but attendance could not be refreshed",
            );
          }
        }
      }
      if (eligibilityChanged) {
        try {
          await ensureLeaveAccruals(companyId);
        } catch (error) {
          req.log?.error(
            { err: error, companyId, employeeId: req.params.id },
            "Employee eligibility was saved, but leave accruals could not be refreshed",
          );
        }
      }
      res.json({ row: after, payrollRefreshWarning });
      return;
    }
    if (
      req.params.entity === "employees" &&
      ("department_id" in parsed.data.values ||
        "branch_id" in parsed.data.values)
    ) {
      const departmentId =
        parsed.data.values.department_id === ""
          ? null
          : (parsed.data.values.department_id ?? before.department_id);
      const branchId =
        parsed.data.values.branch_id === ""
          ? null
          : (parsed.data.values.branch_id ?? before.branch_id);
      const references = await db
        .select({ id: departmentsTable.id })
        .from(departmentsTable)
        .where(eq(departmentsTable.companyId, companyId));
      const branches = await db
        .select({ id: branchesTable.id })
        .from(branchesTable)
        .where(eq(branchesTable.companyId, companyId));
      if (
        (branchId !== null && !branches.some((row) => row.id === branchId)) ||
        (departmentId !== null &&
          !references.some((row) => row.id === departmentId))
      ) {
        res.status(400).json({ error: "Referenced records must belong to the same company." });
        return;
      }
    }
    if (
      req.params.entity === "departments" &&
      parsed.data.values.manager_id
    ) {
      const [manager] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(
              employeesTable.id,
              parsed.data.values.manager_id as string,
            ),
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
        const value = parsed.data.values[key];
        if (
          ["department_id", "branch_id", "manager_id"].includes(key) &&
          value === ""
        ) {
          return [key, null];
        }
        if (databaseBooleanFields.has(key)) {
          if (typeof value === "boolean") return [key, value];
          if (value === "true" || value === "false") {
            return [key, value === "true"];
          }
        }
        if (databaseNumericFields.has(key) && typeof value === "string") {
          return [key, value === "" ? null : Number(value)];
        }
        return [key, value];
      }),
    );
    if (
      Object.values(normalizedValues).some(
        (value) => typeof value === "number" && !Number.isFinite(value),
      )
      ||
      keys.some(
        (key) =>
          databaseBooleanFields.has(key) &&
          typeof normalizedValues[key] !== "boolean",
      )
      ||
      ("work_days_per_month" in normalizedValues &&
        (!Number.isInteger(normalizedValues.work_days_per_month) ||
          Number(normalizedValues.work_days_per_month) < 1 ||
          Number(normalizedValues.work_days_per_month) > 31))
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
    if (!result.rows[0]) {
      res.status(404).json({ error: "Record not found in the selected company." });
      return;
    }
    const after = safeRow((result.rows[0] ?? {}) as Record<string, unknown>);
    let payrollRefreshWarning = false;
    if (
      req.params.entity === "employees" &&
      "work_days_per_month" in parsed.data.values &&
      Number(before.work_days_per_month) !==
        Number(after.work_days_per_month)
    ) {
      payrollRefreshWarning = true;
    }
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
      metadata: {
        fields: keys,
        reason: parsed.data.reason,
        actorRole: "platform_owner",
      },
    });
    if (payrollRefreshWarning) {
      try {
        payrollRefreshWarning = !(await refreshPlatformSupportPayroll(
          companyId,
          context.accountId,
          req,
        ));
      } catch (error) {
        req.log?.error(
          { err: error, companyId, employeeId: req.params.id },
          "Reference workdays were updated, but open payroll periods could not be refreshed",
        );
      }
    }
    res.json({ row: after, payrollRefreshWarning });
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
      await db.execute(
        sql.raw(
          `SELECT * FROM ${sqlIdentifier(table)} WHERE ${sqlIdentifier("id")} = ${sqlStringLiteral(req.params.id)} LIMIT 1`,
        ),
      )
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
        if (req.params.entity === "devices") {
          const dependentTables = [
            "var_hr_employee_identities",
            "var_hr_device_employee_mappings",
            "var_hr_biometric_events",
            "var_hr_biometric_sync_history",
          ];
          for (const dependentTable of dependentTables) {
            await tx.execute(
              sql`DELETE FROM ${sql.raw(sqlIdentifier(dependentTable))} WHERE device_id = ${req.params.id}`,
            );
          }
        }
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
