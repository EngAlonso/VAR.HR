import { boolean, date, integer, index, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { companiesTable, employeesTable, branchesTable } from "./organization";

export const devicesTable = pgTable("var_hr_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  name: text("name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  branchId: uuid("branch_id").notNull().references(() => branchesTable.id),
  adapterKey: text("adapter_key").notNull().default("generic"),
  connectionType: text("connection_type").notNull().default("unknown"),
  host: text("host"),
  port: integer("port"),
  deviceIdentifier: text("device_identifier"),
  biometricCode: text("biometric_code"),
  status: text("status").notNull().default("not_configured"),
  integrationState: text("integration_state").notNull().default("adapter_pending"),
  connectionState: text("connection_state").notNull().default("unknown"),
  lastSync: timestamp("last_sync", { withTimezone: true }),
  lastHealthCheck: timestamp("last_health_check", { withTimezone: true }),
  note: text("note").notNull().default("Connector adapter not configured yet."),
}, (table) => ({
  companyIndex: index("var_hr_devices_company_idx").on(table.companyId),
}));

export const deviceEmployeeMappingsTable = pgTable("var_hr_device_employee_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  deviceId: uuid("device_id").notNull().references(() => devicesTable.id),
  employeeId: uuid("employee_id").notNull().references(() => employeesTable.id),
  deviceEmployeeId: text("device_employee_id").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_device_mappings_company_idx").on(table.companyId),
  deviceIndex: index("var_hr_device_mappings_device_idx").on(table.deviceId),
  deviceIdentityUnique: uniqueIndex("var_hr_device_mappings_device_identity_uidx").on(table.deviceId, table.deviceEmployeeId),
}));

export const biometricEventsTable = pgTable("var_hr_biometric_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  deviceId: uuid("device_id").notNull().references(() => devicesTable.id),
  deviceEmployeeId: text("device_employee_id").notNull(),
  employeeId: uuid("employee_id").references(() => employeesTable.id),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  eventType: text("event_type").notNull(),
  direction: text("direction").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  rawPayload: jsonb("raw_payload").notNull().default({}),
  processingStatus: text("processing_status").notNull().default("received"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_biometric_events_company_idx").on(table.companyId),
  deviceIndex: index("var_hr_biometric_events_device_idx").on(table.deviceId),
  idempotencyUnique: uniqueIndex("var_hr_biometric_events_idempotency_uidx").on(table.companyId, table.idempotencyKey),
}));

export const biometricSyncHistoryTable = pgTable("var_hr_biometric_sync_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  deviceId: uuid("device_id").notNull().references(() => devicesTable.id),
  providerKey: text("provider_key").notNull().default("generic"),
  operation: text("operation").notNull().default("attendance_sync"),
  status: text("status").notNull(),
  message: text("message").notNull(),
  eventsReceived: integer("events_received").notNull().default(0),
  eventsProcessed: integer("events_processed").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => ({
  companyIndex: index("var_hr_biometric_sync_history_company_idx").on(table.companyId),
  deviceIndex: index("var_hr_biometric_sync_history_device_idx").on(table.deviceId),
}));

export const attendanceLocationsTable = pgTable("var_hr_attendance_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companiesTable.id),
  name: text("name").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7, mode: "number" }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7, mode: "number" }).notNull(),
  radiusMeters: integer("radius_meters").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyIndex: index("var_hr_attendance_locations_company_idx").on(table.companyId),
}));

export type Device = typeof devicesTable.$inferSelect;
export type DeviceEmployeeMapping = typeof deviceEmployeeMappingsTable.$inferSelect;
export type BiometricEvent = typeof biometricEventsTable.$inferSelect;
export type BiometricSyncHistory = typeof biometricSyncHistoryTable.$inferSelect;
export type AttendanceLocation = typeof attendanceLocationsTable.$inferSelect;