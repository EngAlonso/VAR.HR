import { Router, type IRouter, type Request } from "express";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  accountPermissionsTable,
  authAuditEventsTable,
  authSessionsTable,
  companiesTable,
  db,
  departmentsTable,
  employeesTable,
  permissionsTable,
  plansTable,
  subscriptionsTable,
  userAccountsTable,
} from "@workspace/db";
import {
  accountRoleLabel,
  clearSessionCookie,
  createSession,
  destroySession,
  ensurePermissionCatalog,
  generateNumericPassword,
  hashPassword,
  loadAuthenticatedAccount,
  replaceAccountPermissions,
  setSessionCookie,
  verifyPassword,
  writeAuthAudit,
} from "../lib/auth";
import {
  WorkspaceAccessError,
  WorkspaceAuthError,
  getTenantContext,
  type TenantContext,
} from "../lib/tenant-context";

const router: IRouter = Router();
const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(256),
});
const staffInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/),
  displayRole: z.string().trim().min(1).max(80),
  password: z.string().min(10).max(256).optional(),
  permissions: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});
const accountUpdateSchema = z.object({
  displayRole: z.string().trim().min(1).max(80).optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
const companyInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  timezone: z.string().trim().min(1).max(80).default("Africa/Cairo"),
  currency: z.string().trim().length(3).default("EGP"),
  employeeLimit: z.number().int().min(1).max(1_000_000),
  ownerUsername: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9._-]+$/),
  ownerPassword: z.string().min(10).max(256).optional(),
  active: z.boolean().default(true),
});
const companyUpdateSchema = z.object({
  active: z.boolean().optional(),
  employeeLimit: z.number().int().min(1).max(1_000_000).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});

function errorMessage(error: unknown): string {
  return error instanceof z.ZodError
    ? error.issues.map((issue) => issue.message).join(", ")
    : "Invalid request.";
}

function accountResponse(account: {
  id: string;
  username: string;
  accountType: string;
  displayRole: string;
  companyId: string | null;
  employeeId: string | null;
  active: boolean;
  permissions?: string[];
}) {
  return {
    id: account.id,
    username: account.username,
    accountType: account.accountType,
    displayRole: accountRoleLabel(account as never),
    companyId: account.companyId,
    employeeId: account.employeeId,
    active: account.active,
    permissions: account.permissions ?? [],
  };
}

async function authenticated(req: Request) {
  const account = await loadAuthenticatedAccount(req);
  if (!account) throw new WorkspaceAuthError();
  return account;
}

async function allowedPermissionKeys(keys: string[]): Promise<string[]> {
  const unique = [...new Set(keys)];
  if (unique.length === 0) return [];
  const rows = await db
    .select({ key: permissionsTable.key })
    .from(permissionsTable)
    .where(inArray(permissionsTable.key, unique));
  const known = new Set(rows.map((row) => row.key));
  const unknown = unique.find((key) => !known.has(key));
  if (unknown) throw new WorkspaceAccessError(`Unknown permission: ${unknown}`);
  return unique;
}

async function requireCompanyOwnerOrPlatform(
  req: Request,
  companyId: string,
): Promise<TenantContext> {
  const context = await getTenantContext(req);
  if (context.role === "platform_owner") return context;
  if (context.role !== "company_owner" || context.companyId !== companyId) {
    throw new WorkspaceAccessError();
  }
  return context;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: errorMessage(parsed.error), code: "INVALID_CREDENTIALS" });
    return;
  }
  const [account] = await db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.username, parsed.data.username))
    .limit(1);
  if (
    !account ||
    !account.active ||
    !verifyPassword(parsed.data.password, account.passwordHash)
  ) {
    req.log.warn(
      { username: parsed.data.username },
      "Rejected authentication attempt",
    );
    res
      .status(401)
      .json({ error: "Invalid username or password.", code: "AUTH_INVALID" });
    return;
  }
  const token = await createSession(account.id);
  await db
    .update(userAccountsTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(userAccountsTable.id, account.id));
  await writeAuthAudit({
    accountId: account.id,
    companyId: account.companyId,
    action: "login",
    entityType: "account",
    entityId: account.id,
  });
  const permissions = (
    await db
      .select({ key: accountPermissionsTable.permissionKey })
      .from(accountPermissionsTable)
      .where(eq(accountPermissionsTable.accountId, account.id))
  ).map((row) => row.key);
  setSessionCookie(res, token);
  res.json({
    user: accountResponse({ ...account, permissions }),
    redirectTo:
      account.accountType === "platform_owner"
        ? "/platform"
        : account.accountType === "employee"
          ? "/"
          : "/",
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const account = await loadAuthenticatedAccount(req);
  if (!account) {
    res.status(401).json({
      error: "A signed-in account is required.",
      code: "AUTH_REQUIRED",
    });
    return;
  }
  res.json({ user: accountResponse(account) });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const account = await loadAuthenticatedAccount(req);
  await destroySession(req);
  clearSessionCookie(res);
  if (account) {
    await writeAuthAudit({
      accountId: account.id,
      companyId: account.companyId,
      action: "logout",
      entityType: "account",
      entityId: account.id,
    });
  }
  res.status(204).send();
});

router.get("/auth/permissions", async (req, res): Promise<void> => {
  await authenticated(req);
  const permissions = await db
    .select()
    .from(permissionsTable)
    .orderBy(asc(permissionsTable.key));
  res.json(
    permissions.map(({ key, label, description }) => ({
      key,
      label,
      description,
    })),
  );
});

router.get("/auth/accounts", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const companyId =
    context.role === "platform_owner" && req.query.companyId
      ? String(req.query.companyId)
      : context.companyId;
  if (context.role !== "platform_owner" && context.role !== "company_owner") {
    res.status(403).json({
      error: "Only company owners can manage staff accounts.",
      code: "ACCOUNT_ACCESS_DENIED",
    });
    return;
  }
  const accounts = await db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.companyId, companyId))
    .orderBy(asc(userAccountsTable.username));
  if (accounts.length === 0) {
    res.json([]);
    return;
  }
  const permissionRows = await db
    .select()
    .from(accountPermissionsTable)
    .where(
      inArray(
        accountPermissionsTable.accountId,
        accounts.map((account) => account.id),
      ),
    );
  const byAccount = new Map<string, string[]>();
  for (const row of permissionRows)
    byAccount.set(row.accountId, [
      ...(byAccount.get(row.accountId) ?? []),
      row.permissionKey,
    ]);
  res.json(
    accounts.map((account) =>
      accountResponse({
        ...account,
        permissions: byAccount.get(account.id) ?? [],
      }),
    ),
  );
});

router.post("/auth/accounts/staff", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (context.role !== "company_owner") {
    res.status(403).json({
      error: "Only a Company Owner can create staff accounts.",
      code: "ACCOUNT_ACCESS_DENIED",
    });
    return;
  }
  const parsed = staffInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: errorMessage(parsed.error), code: "INVALID_ACCOUNT" });
    return;
  }
  const permissions = await allowedPermissionKeys(parsed.data.permissions);
  const [existing] = await db
    .select({ id: userAccountsTable.id })
    .from(userAccountsTable)
    .where(eq(userAccountsTable.username, parsed.data.username))
    .limit(1);
  if (existing) {
    res.status(409).json({
      error: "That username is already in use.",
      code: "USERNAME_TAKEN",
    });
    return;
  }
  const temporaryPassword = parsed.data.password ?? randomStaffPassword();
  const [account] = await db
    .insert(userAccountsTable)
    .values({
      username: parsed.data.username,
      passwordHash: hashPassword(temporaryPassword),
      accountType: "staff",
      displayRole: parsed.data.displayRole,
      companyId: context.companyId,
      active: parsed.data.active,
    })
    .returning();
  await replaceAccountPermissions(account.id, permissions);
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: context.companyId,
    action: "staff_account_created",
    entityType: "account",
    entityId: account.id,
  });
  res.status(201).json({
    account: accountResponse({ ...account, permissions }),
    temporaryPassword,
  });
});

function randomStaffPassword(): string {
  return `${generateNumericPassword()}Aa!`;
}

router.patch("/auth/accounts/:accountId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const accountId = Array.isArray(req.params.accountId)
    ? req.params.accountId[0]
    : req.params.accountId;
  const parsed = accountUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: errorMessage(parsed.error), code: "INVALID_ACCOUNT" });
    return;
  }
  const [account] = await db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.id, accountId))
    .limit(1);
  if (!account) {
    res
      .status(404)
      .json({ error: "Account not found.", code: "ACCOUNT_NOT_FOUND" });
    return;
  }
  const isPlatformManagingOwner =
    context.role === "platform_owner" &&
    account.accountType === "company_owner";
  const isOwnerManagingStaff =
    context.role === "company_owner" &&
    account.companyId === context.companyId &&
    account.accountType === "staff";
  if (!isPlatformManagingOwner && !isOwnerManagingStaff) {
    res.status(403).json({
      error: "This account is outside your management scope.",
      code: "ACCOUNT_ACCESS_DENIED",
    });
    return;
  }
  const permissions = parsed.data.permissions
    ? await allowedPermissionKeys(parsed.data.permissions)
    : undefined;
  const [updated] = await db
    .update(userAccountsTable)
    .set({
      ...(parsed.data.displayRole !== undefined
        ? { displayRole: parsed.data.displayRole }
        : {}),
      ...(parsed.data.active !== undefined
        ? { active: parsed.data.active }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(userAccountsTable.id, account.id))
    .returning();
  if (permissions) await replaceAccountPermissions(account.id, permissions);
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: account.companyId,
    action:
      parsed.data.active === undefined
        ? "permissions_changed"
        : "account_status_changed",
    entityType: "account",
    entityId: account.id,
  });
  res.json({
    account: accountResponse({ ...updated, permissions: permissions ?? [] }),
  });
});

router.post(
  "/auth/accounts/:accountId/reset-password",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    const accountId = Array.isArray(req.params.accountId)
      ? req.params.accountId[0]
      : req.params.accountId;
    const [account] = await db
      .select()
      .from(userAccountsTable)
      .where(eq(userAccountsTable.id, accountId))
      .limit(1);
    if (!account) {
      res
        .status(404)
        .json({ error: "Account not found.", code: "ACCOUNT_NOT_FOUND" });
      return;
    }
    const canReset =
      (context.role === "platform_owner" &&
        account.accountType === "company_owner") ||
      (context.role === "company_owner" &&
        account.companyId === context.companyId &&
        (account.accountType === "staff" ||
          account.accountType === "employee") &&
        (account.accountType === "staff" ||
          context.permissions.includes("employees.credentials")));
    if (!canReset) {
      res.status(403).json({
        error: "You do not have permission to reset this password.",
        code: "ACCOUNT_ACCESS_DENIED",
      });
      return;
    }
    const temporaryPassword =
      account.accountType === "employee"
        ? generateNumericPassword()
        : randomStaffPassword();
    await db
      .update(userAccountsTable)
      .set({
        passwordHash: hashPassword(temporaryPassword),
        updatedAt: new Date(),
      })
      .where(eq(userAccountsTable.id, account.id));
    await db
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.accountId, account.id));
    await writeAuthAudit({
      accountId: context.accountId,
      companyId: account.companyId,
      action: "password_reset",
      entityType: "account",
      entityId: account.id,
    });
    res.json({ username: account.username, temporaryPassword });
  },
);

router.post("/platform/companies", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (context.role !== "platform_owner") {
    res.status(403).json({
      error: "Only the Platform Owner can create companies.",
      code: "PLATFORM_ACCESS_DENIED",
    });
    return;
  }
  const parsed = companyInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: errorMessage(parsed.error), code: "INVALID_COMPANY" });
    return;
  }
  const slug =
    parsed.data.slug ??
    parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70);
  const ownerPassword = parsed.data.ownerPassword ?? randomStaffPassword();
  const [existingSlug] = await db
    .select({ id: companiesTable.id })
    .from(companiesTable)
    .where(eq(companiesTable.slug, slug))
    .limit(1);
  const [existingOwner] = await db
    .select({ id: userAccountsTable.id })
    .from(userAccountsTable)
    .where(eq(userAccountsTable.username, parsed.data.ownerUsername))
    .limit(1);
  if (existingSlug || existingOwner) {
    res.status(409).json({
      error: existingSlug
        ? "That company slug is already in use."
        : "That owner username is already in use.",
      code: "DUPLICATE_COMPANY",
    });
    return;
  }
  const result = await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companiesTable)
      .values({
        name: parsed.data.name,
        slug,
        timezone: parsed.data.timezone,
        currency: parsed.data.currency,
        active: parsed.data.active,
      })
      .returning();
    const [department] = await tx
      .insert(departmentsTable)
      .values({ companyId: company.id, name: "People & Culture" })
      .returning();
    const [plan] = await tx
      .insert(plansTable)
      .values({
        name: `${company.name} plan`,
        employeeLimit: parsed.data.employeeLimit,
        managerLimit: 0,
        branchLimit: 0,
        deviceLimit: 0,
        features: [],
      })
      .returning();
    await tx.insert(subscriptionsTable).values({
      companyId: company.id,
      planId: plan.id,
      employeeLimit: parsed.data.employeeLimit,
      status: parsed.data.active ? "active" : "cancelled",
    });
    const [owner] = await tx
      .insert(userAccountsTable)
      .values({
        username: parsed.data.ownerUsername,
        passwordHash: hashPassword(ownerPassword),
        accountType: "company_owner",
        displayRole: "Company Owner",
        companyId: company.id,
        active: parsed.data.active,
      })
      .returning();
    return { company, owner, department };
  });
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: result.company.id,
    action: "company_created",
    entityType: "company",
    entityId: result.company.id,
  });
  res.status(201).json({
    company: {
      id: result.company.id,
      name: result.company.name,
      slug: result.company.slug,
      timezone: result.company.timezone,
      currency: result.company.currency,
      active: result.company.active,
      employeeLimit: parsed.data.employeeLimit,
    },
    owner: accountResponse(result.owner),
    temporaryPassword: ownerPassword,
  });
});

router.patch(
  "/platform/companies/:companyId",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (context.role !== "platform_owner") {
      res.status(403).json({
        error: "Only the Platform Owner can manage companies.",
        code: "PLATFORM_ACCESS_DENIED",
      });
      return;
    }
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;
    const parsed = companyUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: errorMessage(parsed.error), code: "INVALID_COMPANY" });
      return;
    }
    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);
    if (!company) {
      res
        .status(404)
        .json({ error: "Company not found.", code: "COMPANY_NOT_FOUND" });
      return;
    }
    const active = parsed.data.status
      ? parsed.data.status === "active"
      : parsed.data.active;
    const [updated] = await db
      .update(companiesTable)
      .set({ ...(active === undefined ? {} : { active }) })
      .where(eq(companiesTable.id, company.id))
      .returning();
    if (parsed.data.employeeLimit !== undefined) {
      await db
        .update(subscriptionsTable)
        .set({ employeeLimit: parsed.data.employeeLimit })
        .where(eq(subscriptionsTable.companyId, company.id));
    }
    if (active !== undefined) {
      await db
        .update(userAccountsTable)
        .set({ active })
        .where(eq(userAccountsTable.companyId, company.id));
    }
    await writeAuthAudit({
      accountId: context.accountId,
      companyId: company.id,
      action:
        active === undefined
          ? "subscription_limit_changed"
          : "company_status_changed",
      entityType: "company",
      entityId: company.id,
      metadata: { employeeLimit: parsed.data.employeeLimit },
    });
    const [subscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.companyId, company.id))
      .limit(1);
    res.json({
      company: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        active: updated.active,
        employeeLimit:
          parsed.data.employeeLimit ?? subscription?.employeeLimit ?? 0,
      },
    });
  },
);

router.get("/auth/audit", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (context.role !== "platform_owner" && context.role !== "company_owner") {
    res
      .status(403)
      .json({ error: "Audit access denied.", code: "ACCOUNT_ACCESS_DENIED" });
    return;
  }
  const rows = await db
    .select()
    .from(authAuditEventsTable)
    .where(
      context.role === "platform_owner"
        ? undefined
        : eq(authAuditEventsTable.companyId, context.companyId),
    )
    .orderBy(asc(authAuditEventsTable.createdAt))
    .limit(200);
  res.json(rows.map(({ metadata, ...row }) => ({ ...row, metadata })));
});

export default router;
