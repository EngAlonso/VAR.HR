import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { branchesTable, companiesTable, employeesTable } from "./organization";
import { devicesTable } from "./integrations";

export const userAccountsTable = pgTable("var_hr_user_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull().default(""),
  primaryPhone: text("primary_phone").notNull().default(""),
  backupPhones: text("backup_phones").array().notNull().default([]),
  email: text("email").notNull().default(""),
  backupEmails: text("backup_emails").array().notNull().default([]),
  passwordHash: text("password_hash").notNull(),
  accountType: text("account_type").notNull(),
  displayRole: text("display_role").notNull().default("Staff"),
  companyId: uuid("company_id").references(() => companiesTable.id),
  employeeId: uuid("employee_id").references(() => employeesTable.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
}, (table) => ({
  companyIndex: index("var_hr_user_accounts_company_idx").on(table.companyId),
  employeeIndex: uniqueIndex("var_hr_user_accounts_employee_uidx").on(table.employeeId),
}));

export const permissionsTable = pgTable("var_hr_permissions", {
  key: text("key").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accountPermissionsTable = pgTable("var_hr_account_permissions", {
  accountId: uuid("account_id").notNull().references(() => userAccountsTable.id),
  permissionKey: text("permission_key").notNull().references(() => permissionsTable.key),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  accountIndex: index("var_hr_account_permissions_account_idx").on(table.accountId),
  uniquePermission: uniqueIndex("var_hr_account_permissions_uidx").on(table.accountId, table.permissionKey),
}));

export const employeeIdentitiesTable = pgTable("var_hr_employee_identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  deviceId: uuid("device_id").notNull().references(() => devicesTable.id),
  biometricEmployeeNumber: text("biometric_employee_number").notNull(),
  username: text("username").notNull().unique(),
  accountId: uuid("account_id").notNull().references(() => userAccountsTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_employee_identities_company_idx").on(table.companyId),
  deviceIdentityUnique: uniqueIndex("var_hr_employee_identities_device_uidx").on(table.deviceId, table.biometricEmployeeNumber),
  employeeIndex: uniqueIndex("var_hr_employee_identities_employee_uidx").on(table.employeeId),
}));

export const authSessionsTable = pgTable("var_hr_auth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  accountId: uuid("account_id").notNull().references(() => userAccountsTable.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const authAuditEventsTable = pgTable("var_hr_auth_audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id").references(() => userAccountsTable.id),
  companyId: uuid("company_id").references(() => companiesTable.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  accountIndex: index("var_hr_auth_audit_account_idx").on(table.accountId),
  companyIndex: index("var_hr_auth_audit_company_idx").on(table.companyId),
}));

export const insertUserAccountSchema = createInsertSchema(userAccountsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});
export type UserAccount = typeof userAccountsTable.$inferSelect;
export type InsertUserAccount = z.infer<typeof insertUserAccountSchema>;
export type Permission = typeof permissionsTable.$inferSelect;
export type AccountPermission = typeof accountPermissionsTable.$inferSelect;
export type EmployeeIdentity = typeof employeeIdentitiesTable.$inferSelect;
export type AuthSession = typeof authSessionsTable.$inferSelect;
export type AuthAuditEvent = typeof authAuditEventsTable.$inferSelect;