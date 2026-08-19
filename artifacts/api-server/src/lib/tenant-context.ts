import { and, eq, sql, type SQL } from "drizzle-orm";
import { db, companiesTable, employeesTable } from "@workspace/db";
import type { Request } from "express";
import { translateApiMessage } from "./i18n";
import { loadAuthenticatedAccount, type AccountType } from "./auth";

export type WorkspaceRole =
  "platform_owner" | "company_owner" | "manager" | "employee";

export interface TenantContext {
  companyId: string;
  company: typeof companiesTable.$inferSelect;
  role: WorkspaceRole;
  employeeId: string | null;
  departmentId: string | null;
  branchId: string | null;
  accountId: string;
  accountType: AccountType;
  permissions: string[];
}

export class WorkspaceAuthError extends Error {
  readonly statusCode = 401;
  readonly code = "WORKSPACE_AUTH_REQUIRED";

  constructor(message = "A verified workspace session is required.") {
    super(message);
    this.name = "WorkspaceAuthError";
  }
}

export class WorkspaceAccessError extends Error {
  readonly statusCode = 403;
  readonly code = "WORKSPACE_ACCESS_DENIED";

  constructor(
    message = "The requested workspace is not available to this session.",
  ) {
    super(message);
    this.name = "WorkspaceAccessError";
  }
}

const DEFAULT_TENANT = "northstar";
const LOCALES = ["en", "ar", "fr", "de"] as const;
export type WorkspaceLocale = (typeof LOCALES)[number];

export async function getTenantContext(req: Request): Promise<TenantContext> {
  const account = await loadAuthenticatedAccount(req);
  if (!account) {
    throw new WorkspaceAuthError(
      translateApiMessage(requestedLocale(req), "workspaceAuthRequired"),
    );
  }

  const role: WorkspaceRole =
    account.accountType === "platform_owner"
      ? "platform_owner"
      : account.accountType === "company_owner"
        ? "company_owner"
        : account.accountType === "employee"
          ? "employee"
          : "manager";
  const identityIsScoped = role === "employee";
  const tenantSlug =
    role === "platform_owner" && req.header("x-var-tenant")
      ? req.header("x-var-tenant")!.trim()
      : null;
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(
      tenantSlug
        ? eq(companiesTable.slug, tenantSlug)
        : account.companyId
          ? eq(companiesTable.id, account.companyId)
          : sql`true`,
    )
    .limit(1);

  if (!company || !company.active) {
    throw new WorkspaceAccessError(
      translateApiMessage(requestedLocale(req), "workspaceAccessDenied"),
    );
  }

  const employee = account.employeeId
    ? (
        await db
          .select({
            id: employeesTable.id,
            departmentId: employeesTable.departmentId,
            branchId: employeesTable.branchId,
            role: employeesTable.role,
          })
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.companyId, company.id),
              eq(employeesTable.id, account.employeeId),
            ),
          )
          .limit(1)
      )[0]
    : null;
  if (identityIsScoped && !employee) {
    throw new WorkspaceAccessError(
      translateApiMessage(requestedLocale(req), "workspaceAccessDenied"),
    );
  }

  return {
    companyId: company.id,
    company,
    role,
    employeeId: identityIsScoped ? (employee?.id ?? null) : null,
    departmentId: identityIsScoped ? (employee?.departmentId ?? null) : null,
    branchId: identityIsScoped ? (employee?.branchId ?? null) : null,
    accountId: account.id,
    accountType: account.accountType as AccountType,
    permissions: account.permissions,
  };
}

export function employeeScopeCondition(
  context: TenantContext,
): SQL | undefined {
  if (context.role === "company_owner" || context.role === "platform_owner") {
    return undefined;
  }
  if (context.role === "employee") {
    return context.employeeId
      ? eq(employeesTable.id, context.employeeId)
      : sql`false`;
  }
  return context.departmentId
    ? eq(employeesTable.departmentId, context.departmentId)
    : sql`false`;
}

export function hasCapability(
  context: TenantContext,
  capability: string,
): boolean {
  return workspaceCapabilities(context.role, context.permissions).includes(
    capability,
  );
}

export function workspaceCapabilities(
  role: WorkspaceRole,
  explicitPermissions: string[] = [],
): string[] {
  if (role === "platform_owner") {
    return [
      "employees.view",
      "employees.manage",
      "employees.credentials",
      "attendance.view",
      "attendance.correct",
      "leave.approve",
      "permissions.approve",
      "payroll.view",
      "reports.view",
      "reports.export",
      "devices",
      "sync-history",
      "schedules",
      "holidays",
      "organization.manage",
      "platform.view",
    ];
  }
  if (role === "company_owner") {
    return [
      "employees.view",
      "employees.manage",
      "employees.credentials",
      "attendance.view",
      "attendance.correct",
      "leave.approve",
      "permissions.approve",
      "payroll.view",
      "reports.view",
      "reports.export",
      "devices",
      "sync-history",
      "schedules",
      "holidays",
      "organization.manage",
    ];
  }
  if (role === "manager") {
    return explicitPermissions;
  }
  return [
    "attendance.view",
    "leave.create",
    "permissions.create",
    "reports.view",
  ];
}

export function canManageCompany(
  value: WorkspaceRole | TenantContext,
): boolean {
  if (typeof value !== "string") {
    return (
      value.role === "company_owner" ||
      value.role === "platform_owner" ||
      value.permissions.includes("organization.manage")
    );
  }
  return value === "company_owner" || value === "platform_owner";
}

export function canViewPayroll(value: WorkspaceRole | TenantContext): boolean {
  if (typeof value !== "string") {
    return (
      value.role === "company_owner" ||
      value.role === "platform_owner" ||
      value.permissions.includes("payroll.view")
    );
  }
  return value === "company_owner" || value === "platform_owner";
}

export function canApprove(value: WorkspaceRole | TenantContext): boolean {
  if (typeof value !== "string") {
    return (
      value.role === "company_owner" ||
      value.role === "platform_owner" ||
      value.permissions.includes("leave.approve") ||
      value.permissions.includes("permissions.approve")
    );
  }
  return (
    value === "company_owner" ||
    value === "manager" ||
    value === "platform_owner"
  );
}

export function requestedLocale(req: Request): WorkspaceLocale {
  const value = req.header("x-var-locale");
  return LOCALES.includes(value as WorkspaceLocale)
    ? (value as WorkspaceLocale)
    : "en";
}
