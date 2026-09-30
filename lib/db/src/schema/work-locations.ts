import { createInsertSchema } from "drizzle-zod";
import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { companiesTable, employeesTable } from "./organization";

export const employeeWorkLocationsTable = pgTable(
  "var_hr_employee_work_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    employeeId: uuid("employee_id")
      .notNull()
      .references(() => employeesTable.id),
    workDate: date("work_date", { mode: "string" }).notNull(),
    latitude: numeric("latitude", {
      precision: 10,
      scale: 7,
      mode: "number",
    }).notNull(),
    longitude: numeric("longitude", {
      precision: 10,
      scale: 7,
      mode: "number",
    }).notNull(),
    accuracyMeters: numeric("accuracy_meters", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    comment: text("comment").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    employeeDateIndex: index("var_hr_employee_work_locations_employee_date_idx").on(
      table.companyId,
      table.employeeId,
      table.workDate,
      table.recordedAt,
    ),
  }),
);

export const insertEmployeeWorkLocationSchema = createInsertSchema(
  employeeWorkLocationsTable,
).omit({ id: true, recordedAt: true });

export type EmployeeWorkLocation =
  typeof employeeWorkLocationsTable.$inferSelect;
export type InsertEmployeeWorkLocation = z.infer<
  typeof insertEmployeeWorkLocationSchema
>;