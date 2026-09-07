import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { companiesTable } from "./organization";
import { userAccountsTable } from "./auth";

/**
 * Persisted in-app notifications.
 *
 * userId is the VAR HR account id, not an employee id. companyId is retained
 * on the record so every read can enforce the tenant boundary independently.
 */
export const notificationsTable = pgTable(
  "var_hr_notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userAccountsTable.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userCreatedAtIndex: index("var_hr_notifications_user_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    userReadIndex: index("var_hr_notifications_user_read_idx").on(
      table.userId,
      table.isRead,
    ),
    companyCreatedAtIndex: index(
      "var_hr_notifications_company_created_at_idx",
    ).on(table.companyId, table.createdAt),
  }),
);

/**
 * Web Push subscriptions registered by an authenticated VAR HR account.
 * Endpoints are globally unique because a browser endpoint can only represent
 * one current push subscription at a time.
 */
export const notificationSubscriptionsTable = pgTable(
  "var_hr_notification_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companiesTable.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => userAccountsTable.id),
    endpoint: text("endpoint").notNull(),
    auth: text("auth").notNull(),
    p256dh: text("p256dh").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    endpointUnique: uniqueIndex(
      "var_hr_notification_subscriptions_endpoint_uidx",
    ).on(table.endpoint),
    userIndex: index("var_hr_notification_subscriptions_user_idx").on(
      table.userId,
    ),
    companyIndex: index("var_hr_notification_subscriptions_company_idx").on(
      table.companyId,
    ),
  }),
);

export const insertNotificationSchema = createInsertSchema(
  notificationsTable,
).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSubscriptionSchema = createInsertSchema(
  notificationSubscriptionsTable,
).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationSubscription =
  typeof notificationSubscriptionsTable.$inferSelect;
export type InsertNotificationSubscription = z.infer<
  typeof insertNotificationSubscriptionSchema
>;