import {
  createHash,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import {
  accountPermissionsTable,
  authAuditEventsTable,
  authSessionsTable,
  companiesTable,
  employeesTable,
  plansTable,
  subscriptionsTable,
  devicesTable,
  db,
  permissionsTable,
  userAccountsTable,
  type UserAccount,
} from "@workspace/db";

export const SESSION_COOKIE = "var_hr_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export type AccountType =
  "platform_owner" | "company_owner" | "staff" | "employee";

export interface AuthenticatedAccount extends UserAccount {
  permissions: string[];
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, encoded] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encoded) return false;
  try {
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(encoded, "hex");
    return (
      expected.length === actual.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export function generateNumericPassword(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function deviceLetter(index: number): string {
  let value = Math.max(0, index);
  let result = "";
  do {
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return result;
}

export async function allocateDeviceLetter(companyId: string): Promise<string> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`var_hr_device_letters:${companyId}`}))`,
    );
    const devices = await tx
      .select({ biometricCode: devicesTable.biometricCode })
      .from(devicesTable)
      .where(eq(devicesTable.companyId, companyId));
    const used = new Set(
      devices
        .map((device) => device.biometricCode)
        .filter((code): code is string => Boolean(code)),
    );
    let index = 0;
    while (used.has(deviceLetter(index))) index += 1;
    return deviceLetter(index);
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(accountId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.insert(authSessionsTable).values({
    tokenHash: hashSessionToken(token),
    accountId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function destroySession(req: Request): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token.length > 0) {
    await db
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.tokenHash, hashSessionToken(token)));
  }
}

export async function loadAuthenticatedAccount(
  req: Request,
): Promise<AuthenticatedAccount | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length < 20) return null;
  const [row] = await db
    .select({ account: userAccountsTable, session: authSessionsTable })
    .from(authSessionsTable)
    .innerJoin(
      userAccountsTable,
      eq(authSessionsTable.accountId, userAccountsTable.id),
    )
    .where(
      and(
        eq(authSessionsTable.tokenHash, hashSessionToken(token)),
        gt(authSessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row || !row.account.active) return null;
  const grants = await db
    .select({ key: accountPermissionsTable.permissionKey })
    .from(accountPermissionsTable)
    .where(eq(accountPermissionsTable.accountId, row.account.id));
  await db
    .update(authSessionsTable)
    .set({ lastSeenAt: new Date() })
    .where(eq(authSessionsTable.id, row.session.id));
  return { ...row.account, permissions: grants.map((grant) => grant.key) };
}

export async function writeAuthAudit(input: {
  accountId?: string | null;
  companyId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(authAuditEventsTable).values({
    accountId: input.accountId ?? null,
    companyId: input.companyId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}

export const STANDARD_PERMISSIONS = [
  [
    "employees.view",
    "Employee management",
    "View employee profiles and employee lists.",
  ],
  [
    "employees.manage",
    "Manage employees",
    "Create and update employee records.",
  ],
  [
    "employees.credentials",
    "Employee credentials",
    "Reset and reveal a one-time employee password.",
  ],
  ["attendance.view", "Attendance", "View attendance records."],
  [
    "attendance.correct",
    "Correct attendance",
    "Correct attendance records and rules.",
  ],
  [
    "leave.create",
    "Create leave requests",
    "Submit leave requests for the signed-in employee.",
  ],
  ["leave.approve", "Approve leave", "Approve or reject leave requests."],
  ["permissions.create", "Create permissions", "Submit permission requests."],
  [
    "permissions.approve",
    "Approve permissions",
    "Approve or reject permission requests.",
  ],
  ["schedules", "Schedules", "View and manage work schedules."],
  ["holidays", "Holidays", "View and manage company holidays."],
  ["payroll.view", "Payroll", "View payroll information."],
  ["reports.view", "Reports", "View operational reports."],
  ["reports.export", "Export reports", "Export operational reports."],
  ["devices", "Biometric devices", "Manage biometric devices and mappings."],
  ["sync-history", "Sync history", "View biometric sync history."],
  ["organization.manage", "Organization", "Manage departments and branches."],
] as const;

export async function ensurePermissionCatalog(): Promise<void> {
  for (const [key, label, description] of STANDARD_PERMISSIONS) {
    await db
      .insert(permissionsTable)
      .values({ key, label, description })
      .onConflictDoNothing();
  }
}

export async function replaceAccountPermissions(
  accountId: string,
  permissions: string[],
): Promise<void> {
  await db
    .delete(accountPermissionsTable)
    .where(eq(accountPermissionsTable.accountId, accountId));
  if (permissions.length > 0) {
    await db
      .insert(accountPermissionsTable)
      .values(
        [...new Set(permissions)].map((permissionKey) => ({
          accountId,
          permissionKey,
        })),
      )
      .onConflictDoNothing();
  }
}

export async function getCompanyEmployeeLimit(
  companyId: string,
): Promise<number> {
  const [row] = await db
    .select({
      override: subscriptionsTable.employeeLimit,
      planLimit: plansTable.employeeLimit,
    })
    .from(subscriptionsTable)
    .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.companyId, companyId))
    .limit(1);
  return row?.override ?? row?.planLimit ?? 0;
}

export async function ensureEmployeeCapacity(
  companyId: string,
): Promise<{
  allowed: boolean;
  activeEmployees: number;
  employeeLimit: number;
}> {
  const employeeLimit = await getCompanyEmployeeLimit(companyId);
  const activeEmployees = (
    await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, companyId),
          eq(employeesTable.status, "active"),
        ),
      )
  ).length;
  return {
    allowed: employeeLimit <= 0 || activeEmployees < employeeLimit,
    activeEmployees,
    employeeLimit,
  };
}

export async function hasAccountPermission(
  accountId: string,
  permission: string,
): Promise<boolean> {
  const [grant] = await db
    .select({ accountId: accountPermissionsTable.accountId })
    .from(accountPermissionsTable)
    .where(
      and(
        eq(accountPermissionsTable.accountId, accountId),
        eq(accountPermissionsTable.permissionKey, permission),
      ),
    )
    .limit(1);
  return Boolean(grant);
}

export function accountRoleLabel(
  account: Pick<UserAccount, "accountType" | "displayRole">,
): string {
  if (account.accountType === "platform_owner") return "Platform Owner";
  if (account.accountType === "company_owner") return "Company Owner";
  if (account.accountType === "employee") return "Employee";
  return account.displayRole;
}
