import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, userAccountsTable } from "@workspace/db";
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
  hasUpdatedAt?: boolean;
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
  },
  departments: {
    table: "var_hr_departments",
    label: "Departments",
    columns: ["id", "company_id", "name", "created_at"],
    editable: ["name"],
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
    hasUpdatedAt: true,
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
  },
  holidays: {
    table: "var_hr_holidays",
    label: "Holidays",
    columns: ["id", "company_id", "name", "date", "created_at", "updated_at"],
    editable: ["name", "date"],
    hasUpdatedAt: true,
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
    editable: ["label", "from", "to", "status"],
  },
};

const idSchema = z.string().uuid();
const mutationSchema = z.object({ values: z.record(z.string(), z.unknown()) });
const deleteSchema = z.object({
  ids: z.array(idSchema).min(1).max(500),
  confirmation: z.string().optional(),
});
const clearSchema = z.object({
  confirmation: z.string().min(1),
  search: z.string().trim().max(120).optional(),
});
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

function configFor(name: string): EntityConfig {
  const config = entities[name];
  if (!config) throw new Error("Unknown administration entity.");
  return config;
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
  const columns = config.columns.join(", ");
  const query = search
    ? sql.raw(
        `SELECT ${columns} FROM ${config.table} WHERE to_jsonb(${config.table})::text ILIKE '%' || ${JSON.stringify(`%${search}%`)} LIMIT ${limit} OFFSET ${offset}`,
      )
    : sql.raw(
        `SELECT ${columns} FROM ${config.table} ORDER BY created_at DESC NULLS LAST LIMIT ${limit} OFFSET ${offset}`,
      );
  const result = await db.execute(query);
  const rows = (result.rows as Record<string, unknown>[]).map(safeRow);
  await audit(req, "database_view", req.params.entity, null, {
    count: rows.length,
    search: search || undefined,
  });
  res.json({
    entity: req.params.entity,
    label: config.label,
    columns: config.columns,
    editable: config.editable,
    rows,
  });
});

router.get(
  "/platform/database/:entity/export",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    await requirePlatformOwner(req);
    const result = await db.execute(
      sql.raw(
        `SELECT ${config.columns.join(", ")} FROM ${config.table} ORDER BY created_at DESC NULLS LAST LIMIT 5000`,
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

router.patch(
  "/platform/database/:entity/:id",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    await requirePlatformOwner(req);
    const parsed = mutationSchema.safeParse(req.body);
    if (!parsed.success || !idSchema.safeParse(req.params.id).success) {
      res.status(400).json({ error: "Invalid record update." });
      return;
    }
    const keys = Object.keys(parsed.data.values);
    if (!keys.length || keys.some((key) => !config.editable.includes(key))) {
      res.status(400).json({ error: "One or more fields are not editable." });
      return;
    }
    const setParts = keys.map(
      (key) => sql`${sql.raw(key)} = ${parsed.data.values[key]}`,
    );
    if (config.hasUpdatedAt) setParts.push(sql`updated_at = now()`);
    const result = await db.execute(
      sql`UPDATE ${sql.raw(config.table)} SET ${sql.join(setParts, sql`, `)} WHERE id = ${req.params.id} RETURNING ${sql.raw(config.columns.join(", "))}`,
    );
    const row = safeRow((result.rows[0] ?? {}) as Record<string, unknown>);
    await audit(req, "database_edit", req.params.entity, req.params.id, {
      fields: keys,
    });
    res.json({ row });
  },
);

router.delete("/platform/database/:entity", async (req, res): Promise<void> => {
  const config = configFor(req.params.entity);
  await requirePlatformOwner(req);
  const parsed = deleteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Select at least one valid record." });
    return;
  }
  if (
    parsed.data.ids.length > 1 &&
    parsed.data.confirmation !== "DELETE SELECTED"
  ) {
    res
      .status(400)
      .json({ error: "Type DELETE SELECTED to delete multiple records." });
    return;
  }
  const result = await db.execute(
    sql`DELETE FROM ${sql.raw(config.table)} WHERE id IN (${sql.join(
      parsed.data.ids.map((id) => sql`${id}`),
      sql`, `,
    )}) RETURNING id`,
  );
  await audit(req, "database_delete", req.params.entity, null, {
    ids: parsed.data.ids,
    affected: result.rows.length,
  });
  res.json({ affected: result.rows.length });
});

router.post(
  "/platform/database/:entity/clear",
  async (req, res): Promise<void> => {
    const config = configFor(req.params.entity);
    await requirePlatformOwner(req);
    const parsed = clearSchema.safeParse(req.body);
    if (
      !parsed.success ||
      parsed.data.confirmation !== `CLEAR ${req.params.entity.toUpperCase()}`
    ) {
      res.status(400).json({
        error: `Type CLEAR ${req.params.entity.toUpperCase()} to clear this entity.`,
      });
      return;
    }
    const search = parsed.data.search?.trim();
    const query = search
      ? sql.raw(
          `DELETE FROM ${config.table} WHERE to_jsonb(${config.table})::text ILIKE '%' || ${JSON.stringify(`%${search}%`)} RETURNING id`,
        )
      : sql.raw(`DELETE FROM ${config.table} RETURNING id`);
    const result = await db.execute(query);
    await audit(req, "database_clear", req.params.entity, null, {
      affected: result.rows.length,
      filtered: Boolean(search),
    });
    res.json({ affected: result.rows.length });
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
