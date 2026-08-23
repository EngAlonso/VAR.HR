import { Router, type IRouter, type Request } from "express";
import { and, asc, eq, inArray, or } from "drizzle-orm";
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
import { buildBackupPayload } from "../lib/backups";

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
const optionalPhone = z.string().trim().refine((value) => value === "" || /^\+?[0-9 ()-]{7,20}$/i.test(value), "Invalid phone number.");
const optionalEmail = z.string().trim().refine((value) => value === "" || z.string().email().safeParse(value).success, "Invalid email address.");
const requiredPermanentPassword = z.string().max(256).superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Permanent password is required." });
  } else if (value.length < 6) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Permanent password must be at least 6 characters." });
  }
});
const accountUpdateSchema = z.object({
  username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/).optional(),
  displayRole: z.string().trim().min(1).max(80).optional(),
  fullName: z.string().trim().max(160).optional(),
  primaryPhone: optionalPhone.optional(),
  backupPhones: z.array(optionalPhone).optional(),
  email: optionalEmail.optional(),
  backupEmails: z.array(optionalEmail).optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});
const permanentPasswordSchema = z.object({
  password: z.string().min(10).max(256),
});
const companyInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().max(500).default(""),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  timezone: z.string().trim().min(1).max(80).default("Africa/Cairo"),
  currency: z.string().trim().length(3).default("EGP"),
  employeeLimit: z.number().int().min(0).max(1_000_000).default(0),
  ownerCount: z.number().int().min(0).max(20).default(0),
  owners: z.array(z.object({
    fullName: z.string().trim().max(160).default(""),
    username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/),
    password: requiredPermanentPassword,
    primaryPhone: optionalPhone.default(""),
    backupPhones: z.array(optionalPhone).default([]),
    email: optionalEmail.default(""),
    backupEmails: z.array(optionalEmail).default([]),
  })).max(20).default([]),
  monthlyPrice: z.number().finite().min(0).max(1_000_000_000).default(0),
  annualPrice: z.number().finite().min(0).max(1_000_000_000).default(0),
  active: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.owners.length !== value.ownerCount) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["owners"], message: "The owner count must exactly match the owner accounts provided." });
  }
});
const companyUpdateSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  address: z.string().trim().max(500).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  currency: z.string().trim().length(3).optional(),
  active: z.boolean().optional(),
  employeeLimit: z.number().int().min(0).max(1_000_000).optional(),
  monthlyPrice: z.number().finite().min(0).max(1_000_000_000).optional(),
  annualPrice: z.number().finite().min(0).max(1_000_000_000).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});
const companyOwnersUpdateSchema = z.object({
  ownerCount: z.number().int().min(0).max(20),
  owners: z.array(z.object({
    id: z.string().uuid().optional(),
    fullName: z.string().trim().max(160).default(""),
    username: z.string().trim().min(3).max(80).regex(/^[a-zA-Z0-9._-]+$/),
    password: z.string().min(10).max(256).optional(),
    primaryPhone: optionalPhone.default(""),
    backupPhones: z.array(optionalPhone).default([]),
    email: optionalEmail.default(""),
    backupEmails: z.array(optionalEmail).default([]),
  })).max(20),
}).superRefine((value, ctx) => {
  if (value.owners.length < value.ownerCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["owners"],
      message: "The owner accounts provided must cover the requested owner count.",
    });
  }
  for (const owner of value.owners) {
    if (!owner.id && !owner.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["owners"],
        message: "A permanent password is required for each new owner account.",
      });
    }
  }
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
  fullName?: string;
  primaryPhone?: string;
  backupPhones?: string[];
  email?: string;
  backupEmails?: string[];
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
    fullName: account.fullName ?? "",
    primaryPhone: account.primaryPhone ?? "",
    backupPhones: account.backupPhones ?? [],
    email: account.email ?? "",
    backupEmails: account.backupEmails ?? [],
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

router.get(
  "/platform/companies/:companyId/owners",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (context.role !== "platform_owner") {
      res.status(403).json({
        error: "Only the Platform Owner can manage Company Owner accounts.",
        code: "PLATFORM_ACCESS_DENIED",
      });
      return;
    }
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;
    const parsedCompanyId = z.string().uuid().safeParse(companyId);
    if (!parsedCompanyId.success) {
      res.status(400).json({
        error: "A valid company ID is required.",
        code: "INVALID_COMPANY",
      });
      return;
    }
    const accounts = await db
      .select()
      .from(userAccountsTable)
      .where(
        and(
          eq(userAccountsTable.companyId, parsedCompanyId.data),
          eq(userAccountsTable.accountType, "company_owner"),
        ),
      )
      .orderBy(asc(userAccountsTable.username));
    res.json(accounts.map((account) => accountResponse(account)));
  },
);

router.get(
  "/platform/companies/:companyId/details",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (context.role !== "platform_owner") {
      res.status(403).json({
        error: "Only the Platform Owner can view company details.",
        code: "PLATFORM_ACCESS_DENIED",
      });
      return;
    }
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;
    const parsedCompanyId = z.string().uuid().safeParse(companyId);
    if (!parsedCompanyId.success) {
      res.status(400).json({ error: "A valid company ID is required.", code: "INVALID_COMPANY" });
      return;
    }
    const [company] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, parsedCompanyId.data))
      .limit(1);
    if (!company) {
      res.status(404).json({ error: "Company not found.", code: "COMPANY_NOT_FOUND" });
      return;
    }
    const [subscription] = await db
      .select({ subscription: subscriptionsTable, plan: plansTable })
      .from(subscriptionsTable)
      .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.companyId, company.id))
      .limit(1);
    const backup = await buildBackupPayload("company", company.id);
    const accounts = (backup.payload.data.var_hr_user_accounts ?? []).map((account) => ({
      id: String(account.id ?? ""),
      username: String(account.username ?? ""),
      accountType: String(account.account_type ?? ""),
      displayRole: String(account.display_role ?? ""),
      companyId: account.company_id == null ? null : String(account.company_id),
      employeeId: account.employee_id == null ? null : String(account.employee_id),
      active: Boolean(account.active),
      fullName: String(account.full_name ?? ""),
      primaryPhone: String(account.primary_phone ?? ""),
      backupPhones: Array.isArray(account.backup_phones) ? account.backup_phones : [],
      email: String(account.email ?? ""),
      backupEmails: Array.isArray(account.backup_emails) ? account.backup_emails : [],
    }));
    const owners = accounts.filter((account) => account.accountType === "company_owner");
    const staff = accounts.filter(
      (account) =>
        account.accountType === "staff" || account.accountType === "manager",
    );
    const employees = backup.payload.data.var_hr_employees ?? [];
    const devices = backup.payload.data.var_hr_devices ?? [];
    const operationalData = Object.fromEntries(
      Object.entries(backup.payload.data)
        .filter(([table]) => !["var_hr_companies", "var_hr_user_accounts", "var_hr_permissions", "var_hr_plans"].includes(table))
        .map(([table, rows]) => [table, rows]),
    );
    res.json({
      company,
      subscription: subscription
        ? {
            status: subscription.subscription.status,
            monthlyPrice: subscription.subscription.monthlyPrice,
            annualPrice: subscription.subscription.annualPrice,
            employeeLimit: subscription.subscription.employeeLimit ?? subscription.plan.employeeLimit,
            planName: subscription.plan.name,
          }
        : null,
      owners,
      staff,
      employees,
      devices,
      operationalData,
      tableCounts: Object.fromEntries(
        Object.entries(backup.payload.data).map(([table, rows]) => [table, rows.length]),
      ),
      integrity: backup.payload.manifest.integrity,
    });
  },
);

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
  if (parsed.data.username !== undefined && parsed.data.username !== account.username) {
    const [existingUsername] = await db
      .select({ id: userAccountsTable.id })
      .from(userAccountsTable)
      .where(eq(userAccountsTable.username, parsed.data.username))
      .limit(1);
    if (existingUsername && existingUsername.id !== account.id) {
      res.status(409).json({
        error: "That username is already in use.",
        code: "USERNAME_TAKEN",
      });
      return;
    }
  }
  if (
    parsed.data.primaryPhone !== undefined ||
    parsed.data.backupPhones !== undefined ||
    parsed.data.email !== undefined ||
    parsed.data.backupEmails !== undefined
  ) {
    const allAccounts = await db
      .select({
        id: userAccountsTable.id,
        email: userAccountsTable.email,
        primaryPhone: userAccountsTable.primaryPhone,
        backupPhones: userAccountsTable.backupPhones,
        backupEmails: userAccountsTable.backupEmails,
      })
      .from(userAccountsTable);
    const nextEmails = [
      parsed.data.email ?? account.email,
      ...(parsed.data.backupEmails ?? account.backupEmails),
    ].filter(Boolean).map((email) => email.toLowerCase());
    const nextPhones = [
      parsed.data.primaryPhone ?? account.primaryPhone,
      ...(parsed.data.backupPhones ?? account.backupPhones),
    ].filter(Boolean).map((phone) => phone.replace(/\D/g, ""));
    const conflicting = allAccounts.filter((candidate) => candidate.id !== account.id);
    const existingEmails = new Set(
      conflicting
        .flatMap((candidate) => [candidate.email, ...candidate.backupEmails])
        .filter(Boolean)
        .map((email) => email.toLowerCase()),
    );
    const existingPhones = new Set(
      conflicting
        .flatMap((candidate) => [candidate.primaryPhone, ...candidate.backupPhones])
        .filter(Boolean)
        .map((phone) => phone.replace(/\D/g, "")),
    );
    if (new Set(nextEmails).size !== nextEmails.length || nextEmails.some((email) => existingEmails.has(email))) {
      res.status(409).json({
        error: "That owner email is already in use.",
        code: "DUPLICATE_OWNER_CONTACT",
      });
      return;
    }
    if (new Set(nextPhones).size !== nextPhones.length || nextPhones.some((phone) => existingPhones.has(phone))) {
      res.status(409).json({
        error: "That owner phone number is already in use.",
        code: "DUPLICATE_OWNER_CONTACT",
      });
      return;
    }
  }
  const permissions = parsed.data.permissions
    ? await allowedPermissionKeys(parsed.data.permissions)
    : undefined;
  const [updated] = await db
    .update(userAccountsTable)
    .set({
      ...(parsed.data.username !== undefined ? { username: parsed.data.username } : {}),
      ...(parsed.data.displayRole !== undefined
        ? { displayRole: parsed.data.displayRole }
        : {}),
      ...(parsed.data.fullName !== undefined ? { fullName: parsed.data.fullName } : {}),
      ...(parsed.data.primaryPhone !== undefined ? { primaryPhone: parsed.data.primaryPhone } : {}),
      ...(parsed.data.backupPhones !== undefined ? { backupPhones: parsed.data.backupPhones } : {}),
      ...(parsed.data.email !== undefined ? { email: parsed.data.email } : {}),
      ...(parsed.data.backupEmails !== undefined ? { backupEmails: parsed.data.backupEmails } : {}),
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
      parsed.data.active === undefined &&
      parsed.data.permissions === undefined &&
      (parsed.data.username !== undefined ||
        parsed.data.fullName !== undefined ||
        parsed.data.primaryPhone !== undefined ||
        parsed.data.backupPhones !== undefined ||
        parsed.data.email !== undefined ||
        parsed.data.backupEmails !== undefined)
        ? "account_details_changed"
        : parsed.data.active === undefined
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

router.post(
  "/auth/accounts/:accountId/set-password",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    const accountId = Array.isArray(req.params.accountId)
      ? req.params.accountId[0]
      : req.params.accountId;
    const parsed = permanentPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: errorMessage(parsed.error), code: "INVALID_PASSWORD" });
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
    if (
      context.role !== "platform_owner" ||
      account.accountType !== "company_owner"
    ) {
      res.status(403).json({
        error: "Only the Platform Owner can set a Company Owner password.",
        code: "ACCOUNT_ACCESS_DENIED",
      });
      return;
    }
    await db
      .update(userAccountsTable)
      .set({ passwordHash: hashPassword(parsed.data.password), updatedAt: new Date() })
      .where(eq(userAccountsTable.id, account.id));
    await db
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.accountId, account.id));
    await writeAuthAudit({
      accountId: context.accountId,
      companyId: account.companyId,
      action: "company_owner_password_set",
      entityType: "account",
      entityId: account.id,
    });
    res.json({ account: accountResponse(account) });
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
  const usernames = parsed.data.owners.map((owner) => owner.username.toLowerCase());
  const emails = parsed.data.owners.flatMap((owner) => [owner.email, ...owner.backupEmails].map((email) => email.toLowerCase()));
  const phones = parsed.data.owners.flatMap((owner) => [owner.primaryPhone, ...owner.backupPhones].map((phone) => phone.replace(/\D/g, "")));
  if (new Set(usernames).size !== usernames.length || new Set(emails).size !== emails.length || new Set(phones).size !== phones.length) {
    res.status(409).json({ error: "Owner usernames, emails, and phone numbers must be unique.", code: "DUPLICATE_OWNER_CONTACT" });
    return;
  }
  const [existingSlug] = await db
    .select({ id: companiesTable.id })
    .from(companiesTable)
    .where(eq(companiesTable.slug, slug))
    .limit(1);
  const existingAccounts = await db
    .select({
      username: userAccountsTable.username,
      email: userAccountsTable.email,
      primaryPhone: userAccountsTable.primaryPhone,
      backupPhones: userAccountsTable.backupPhones,
      backupEmails: userAccountsTable.backupEmails,
    })
    .from(userAccountsTable);
  const existingUsernames = new Set(existingAccounts.map((account) => account.username.toLowerCase()));
  const existingEmails = new Set(existingAccounts.flatMap((account) => [account.email, ...account.backupEmails]).filter(Boolean).map((email) => email.toLowerCase()));
  const existingPhones = new Set(existingAccounts.flatMap((account) => [account.primaryPhone, ...account.backupPhones]).filter(Boolean).map((phone) => phone.replace(/\D/g, "")));
  const duplicateUsername = usernames.some((username) => existingUsernames.has(username));
  const duplicateEmail = emails.some((email) => existingEmails.has(email));
  const duplicatePhone = phones.some((phone) => existingPhones.has(phone));
  if (existingSlug || duplicateUsername || duplicateEmail || duplicatePhone) {
    res.status(409).json({
      error: existingSlug
        ? "That company slug is already in use."
        : duplicateUsername ? "That owner username is already in use."
          : duplicateEmail ? "That owner email is already in use."
            : "That owner phone number is already in use.",
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
        address: parsed.data.address,
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
      monthlyPrice: parsed.data.monthlyPrice,
      annualPrice: parsed.data.annualPrice,
    });
    const owners = parsed.data.owners.length ? await tx
      .insert(userAccountsTable)
      .values(parsed.data.owners.map((owner) => ({
        username: owner.username,
        fullName: owner.fullName,
        primaryPhone: owner.primaryPhone,
        backupPhones: owner.backupPhones,
        email: owner.email,
        backupEmails: owner.backupEmails,
        passwordHash: hashPassword(owner.password),
        accountType: "company_owner",
        displayRole: "Company Owner",
        companyId: company.id,
        active: parsed.data.active,
      })))
      .returning() : [];
    return { company, owners, department };
  });
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: result.company.id,
    action: "company_created",
    entityType: "company",
    entityId: result.company.id,
  });
  await Promise.all(result.owners.map((owner) => writeAuthAudit({
    accountId: context.accountId,
    companyId: result.company.id,
    action: "company_owner_account_created",
    entityType: "account",
    entityId: owner.id,
    metadata: { username: owner.username },
  })));
  res.status(201).json({
    company: {
      id: result.company.id,
      name: result.company.name,
      slug: result.company.slug,
      address: result.company.address,
      timezone: result.company.timezone,
      currency: result.company.currency,
      active: result.company.active,
      employeeLimit: parsed.data.employeeLimit,
    },
    owners: result.owners.map(accountResponse),
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
    const [currentSubscription] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.companyId, company.id))
      .limit(1);
    const priceChanged =
      parsed.data.monthlyPrice !== undefined ||
      parsed.data.annualPrice !== undefined;
    const nextMonthlyPrice =
      parsed.data.monthlyPrice ?? currentSubscription?.monthlyPrice ?? 0;
    const nextAnnualPrice =
      parsed.data.annualPrice ?? currentSubscription?.annualPrice ?? 0;
    const active = parsed.data.status
      ? parsed.data.status === "active"
      : parsed.data.active;
    const companyChanges = {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.address !== undefined ? { address: parsed.data.address } : {}),
      ...(parsed.data.timezone !== undefined
        ? { timezone: parsed.data.timezone }
        : {}),
      ...(parsed.data.currency !== undefined
        ? { currency: parsed.data.currency }
        : {}),
      ...(active === undefined ? {} : { active }),
    };
    const [updated] = Object.keys(companyChanges).length
      ? await db
          .update(companiesTable)
          .set(companyChanges)
          .where(eq(companiesTable.id, company.id))
          .returning()
      : [company];
    if (parsed.data.employeeLimit !== undefined) {
      await db
        .update(subscriptionsTable)
        .set({ employeeLimit: parsed.data.employeeLimit })
        .where(eq(subscriptionsTable.companyId, company.id));
    }
    if (priceChanged) {
      await db
        .update(subscriptionsTable)
        .set({
          monthlyPrice: nextMonthlyPrice,
          annualPrice: nextAnnualPrice,
        })
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
        priceChanged
          ? "subscription_pricing_changed"
          :
        parsed.data.name !== undefined ||
        parsed.data.address !== undefined ||
        parsed.data.timezone !== undefined ||
        parsed.data.currency !== undefined
          ? "company_updated"
          : active === undefined
            ? "subscription_limit_changed"
            : "company_status_changed",
      entityType: "company",
      entityId: company.id,
      metadata: {
        ...(parsed.data.employeeLimit !== undefined
          ? { employeeLimit: parsed.data.employeeLimit }
          : {}),
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.address !== undefined ? { address: parsed.data.address } : {}),
        ...(parsed.data.timezone !== undefined
          ? { timezone: parsed.data.timezone }
          : {}),
        ...(parsed.data.currency !== undefined
          ? { currency: parsed.data.currency }
          : {}),
        ...(priceChanged
          ? {
              before: {
                monthlyPrice: currentSubscription?.monthlyPrice ?? 0,
                annualPrice: currentSubscription?.annualPrice ?? 0,
              },
              after: {
                monthlyPrice: nextMonthlyPrice,
                annualPrice: nextAnnualPrice,
              },
            }
          : {}),
      },
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
         address: updated.address,
        slug: updated.slug,
        timezone: updated.timezone,
        currency: updated.currency,
        active: updated.active,
        employeeLimit:
          parsed.data.employeeLimit ?? subscription?.employeeLimit ?? 0,
      },
    });
  },
);

router.patch(
  "/platform/companies/:companyId/owners",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (context.role !== "platform_owner") {
      res.status(403).json({
        error: "Only the Platform Owner can manage Company Owner accounts.",
        code: "PLATFORM_ACCESS_DENIED",
      });
      return;
    }
    const companyId = Array.isArray(req.params.companyId)
      ? req.params.companyId[0]
      : req.params.companyId;
    const parsedCompanyId = z.string().uuid().safeParse(companyId);
    if (!parsedCompanyId.success) {
      res.status(400).json({
        error: "A valid company ID is required.",
        code: "INVALID_COMPANY",
      });
      return;
    }
    const parsed = companyOwnersUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: errorMessage(parsed.error),
        code: "INVALID_OWNER_ACCOUNTS",
      });
      return;
    }
    const [company] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(eq(companiesTable.id, parsedCompanyId.data))
      .limit(1);
    if (!company) {
      res.status(404).json({
        error: "Company not found.",
        code: "COMPANY_NOT_FOUND",
      });
      return;
    }
    const existingOwners = await db
      .select()
      .from(userAccountsTable)
      .where(
        and(
          eq(userAccountsTable.companyId, company.id),
          eq(userAccountsTable.accountType, "company_owner"),
        ),
      )
      .orderBy(asc(userAccountsTable.username));
    const existingOwnerIds = new Set(existingOwners.map((owner) => owner.id));
    const submittedExistingIds = parsed.data.owners
      .map((owner) => owner.id)
      .filter((id): id is string => Boolean(id));
    if (
      new Set(submittedExistingIds).size !== submittedExistingIds.length ||
      submittedExistingIds.some((id) => !existingOwnerIds.has(id)) ||
      existingOwners.some((owner) => !submittedExistingIds.includes(owner.id))
    ) {
      res.status(400).json({
        error: "The submitted owner accounts do not match this company.",
        code: "OWNER_ACCOUNT_MISMATCH",
      });
      return;
    }
    const retainedOwners = parsed.data.owners.slice(0, parsed.data.ownerCount);
    const retainedIds = new Set(
      retainedOwners
        .map((owner) => owner.id)
        .filter((id): id is string => Boolean(id)),
    );
    const allAccounts = await db
      .select({
        id: userAccountsTable.id,
        username: userAccountsTable.username,
        email: userAccountsTable.email,
        primaryPhone: userAccountsTable.primaryPhone,
        backupPhones: userAccountsTable.backupPhones,
        backupEmails: userAccountsTable.backupEmails,
      })
      .from(userAccountsTable);
    const submittedUsernames = parsed.data.owners.map((owner) => owner.username.toLowerCase());
    const submittedEmails = parsed.data.owners
      .flatMap((owner) => [owner.email, ...owner.backupEmails])
      .filter(Boolean)
      .map((email) => email.toLowerCase());
    const submittedPhones = parsed.data.owners
      .flatMap((owner) => [owner.primaryPhone, ...owner.backupPhones])
      .filter(Boolean)
      .map((phone) => phone.replace(/\D/g, ""));
    const otherAccounts = allAccounts.filter(
      (account) => !existingOwnerIds.has(account.id),
    );
    const existingUsernames = new Set(
      otherAccounts.map((account) => account.username.toLowerCase()),
    );
    const existingEmails = new Set(
      otherAccounts
        .flatMap((account) => [account.email, ...account.backupEmails])
        .filter(Boolean)
        .map((email) => email.toLowerCase()),
    );
    const existingPhones = new Set(
      otherAccounts
        .flatMap((account) => [account.primaryPhone, ...account.backupPhones])
        .filter(Boolean)
        .map((phone) => phone.replace(/\D/g, "")),
    );
    if (
      new Set(submittedUsernames).size !== submittedUsernames.length ||
      submittedUsernames.some((username) => existingUsernames.has(username))
    ) {
      res.status(409).json({
        error: "That owner username is already in use.",
        code: "USERNAME_TAKEN",
      });
      return;
    }
    if (
      new Set(submittedEmails).size !== submittedEmails.length ||
      submittedEmails.some((email) => existingEmails.has(email))
    ) {
      res.status(409).json({
        error: "That owner email is already in use.",
        code: "DUPLICATE_OWNER_CONTACT",
      });
      return;
    }
    if (
      new Set(submittedPhones).size !== submittedPhones.length ||
      submittedPhones.some((phone) => existingPhones.has(phone))
    ) {
      res.status(409).json({
        error: "That owner phone number is already in use.",
        code: "DUPLICATE_OWNER_CONTACT",
      });
      return;
    }
    const auditEvents: Array<{
      action: string;
      entityId: string;
      metadata?: Record<string, unknown>;
    }> = [];
    const result = await db.transaction(async (tx) => {
      const owners = [];
      for (const owner of retainedOwners) {
        if (owner.id) {
          const [updated] = await tx
            .update(userAccountsTable)
            .set({
              username: owner.username,
              fullName: owner.fullName,
              primaryPhone: owner.primaryPhone,
              backupPhones: owner.backupPhones,
              email: owner.email,
              backupEmails: owner.backupEmails,
              active: true,
              updatedAt: new Date(),
            })
            .where(eq(userAccountsTable.id, owner.id))
            .returning();
          owners.push(updated);
          auditEvents.push({
            action: "company_owner_updated",
            entityId: owner.id,
            metadata: { username: owner.username },
          });
        } else {
          const [created] = await tx
            .insert(userAccountsTable)
            .values({
              username: owner.username,
              fullName: owner.fullName,
              primaryPhone: owner.primaryPhone,
              backupPhones: owner.backupPhones,
              email: owner.email,
              backupEmails: owner.backupEmails,
              passwordHash: hashPassword(owner.password ?? ""),
              accountType: "company_owner",
              displayRole: "Company Owner",
              companyId: company.id,
              active: true,
            })
            .returning();
          owners.push(created);
          auditEvents.push({
            action: "company_owner_account_created",
            entityId: created.id,
            metadata: { username: created.username },
          });
        }
      }
      for (const owner of existingOwners) {
        if (!retainedIds.has(owner.id)) {
          await tx
            .update(userAccountsTable)
            .set({ active: false, updatedAt: new Date() })
            .where(eq(userAccountsTable.id, owner.id));
          auditEvents.push({
            action: "company_owner_account_deactivated",
            entityId: owner.id,
            metadata: { reason: "owner_count_reduced" },
          });
        }
      }
      return owners;
    });
    await Promise.all(
      auditEvents.map((event) =>
        writeAuthAudit({
          accountId: context.accountId,
          companyId: company.id,
          action: event.action,
          entityType: "account",
          entityId: event.entityId,
          metadata: event.metadata,
        }),
      ),
    );
    const owners = await db
      .select()
      .from(userAccountsTable)
      .where(
        and(
          eq(userAccountsTable.companyId, company.id),
          eq(userAccountsTable.accountType, "company_owner"),
        ),
      )
      .orderBy(asc(userAccountsTable.username));
    res.json({ owners: owners.map(accountResponse), updated: result.length });
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
