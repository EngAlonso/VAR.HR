import webpush, { type PushSubscription } from "web-push";
import {
  and,
  count,
  desc,
  eq,
  type SQL,
} from "drizzle-orm";
import {
  db,
  notificationSubscriptionsTable,
  notificationsTable,
  type Notification,
  type NotificationSubscription,
} from "@workspace/db";
import { logger } from "../lib/logger";

export interface NotificationContent {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  icon?: string;
  badge?: string;
  tag?: string;
}

export interface NotificationScope {
  companyId: string;
  userId: string;
}

export interface NotificationListOptions extends NotificationScope {
  page: number;
  pageSize: number;
}

export interface NotificationListResult {
  items: Notification[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface NotificationDeliveryResult {
  attempted: number;
  delivered: number;
  removed: number;
  failed: number;
}

export interface NotificationSubscriptionInput extends NotificationScope {
  endpoint: string;
  auth: string;
  p256dh: string;
  userAgent?: string;
}

export class NotificationServiceError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

export class NotificationSubscriptionConflictError extends NotificationServiceError {
  constructor() {
    super(
      409,
      "NOTIFICATION_SUBSCRIPTION_CONFLICT",
      "This push endpoint is already registered to another account.",
    );
  }
}

let vapidConfigured = false;

function vapidDetails(): {
  subject: string;
  publicKey: string;
  privateKey: string;
} {
  const subject = process.env["VAPID_SUBJECT"]?.trim();
  const publicKey = process.env["VAPID_PUBLIC_KEY"]?.trim();
  const privateKey = process.env["VAPID_PRIVATE_KEY"]?.trim();

  if (!subject || !publicKey || !privateKey) {
    throw new NotificationServiceError(
      503,
      "WEB_PUSH_NOT_CONFIGURED",
      "Web Push is not configured. Set VAPID_SUBJECT, VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY.",
    );
  }

  return { subject, publicKey, privateKey };
}

function ensureVapidConfigured(): void {
  if (vapidConfigured) return;
  const { subject, publicKey, privateKey } = vapidDetails();
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  } catch (error) {
    logger.error({ err: error }, "Invalid Web Push VAPID configuration");
    throw new NotificationServiceError(
      500,
      "WEB_PUSH_CONFIGURATION_INVALID",
      "The configured Web Push VAPID keys are invalid.",
    );
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function pushPayload(content: NotificationContent): Record<string, unknown> {
  const data = content.data ?? {};
  return {
    title: content.title,
    body: content.message,
    type: content.type,
    data,
    icon: content.icon ?? stringValue(data["icon"]),
    badge: content.badge ?? stringValue(data["badge"]),
    tag: content.tag ?? stringValue(data["tag"]),
  };
}

function errorStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) {
    return undefined;
  }
  const statusCode = error.statusCode;
  return typeof statusCode === "number" ? statusCode : undefined;
}

function staleSubscription(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410;
}

function subscriptionPayload(
  subscription: NotificationSubscription,
): PushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.auth,
      p256dh: subscription.p256dh,
    },
  };
}

function notificationWhere(scope: NotificationScope, id?: string): SQL {
  const conditions = [
    eq(notificationsTable.companyId, scope.companyId),
    eq(notificationsTable.userId, scope.userId),
  ];
  if (id) conditions.push(eq(notificationsTable.id, id));
  return and(...conditions)!;
}

function subscriptionWhere(
  scope: NotificationScope,
  endpoint?: string,
): SQL {
  const conditions = [
    eq(notificationSubscriptionsTable.companyId, scope.companyId),
    eq(notificationSubscriptionsTable.userId, scope.userId),
  ];
  if (endpoint) conditions.push(eq(notificationSubscriptionsTable.endpoint, endpoint));
  return and(...conditions)!;
}

function notificationData(content: NotificationContent): Record<string, unknown> {
  return {
    ...(content.data ?? {}),
    ...(content.icon ? { icon: content.icon } : {}),
    ...(content.badge ? { badge: content.badge } : {}),
    ...(content.tag ? { tag: content.tag } : {}),
  };
}

export async function saveNotification(
  scope: NotificationScope,
  content: NotificationContent,
): Promise<Notification> {
  try {
    const [notification] = await db
      .insert(notificationsTable)
      .values({
        companyId: scope.companyId,
        userId: scope.userId,
        type: content.type,
        title: content.title,
        message: content.message,
        data: notificationData(content),
      })
      .returning();

    if (!notification) {
      throw new NotificationServiceError(
        500,
        "NOTIFICATION_SAVE_FAILED",
        "The notification could not be saved.",
      );
    }
    return notification;
  } catch (error) {
    logger.error(
      { err: error, companyId: scope.companyId, userId: scope.userId },
      "Failed to save notification",
    );
    throw error;
  }
}

async function sendToSubscription(
  subscription: NotificationSubscription,
  content: NotificationContent,
  scope: NotificationScope,
): Promise<"delivered" | "removed"> {
  try {
    await webpush.sendNotification(
      subscriptionPayload(subscription),
      JSON.stringify(pushPayload(content)),
      {
        TTL: 86_400,
        urgency: "normal",
        ...(content.tag ? { topic: content.tag.slice(0, 32) } : {}),
      },
    );
    return "delivered";
  } catch (error) {
    const statusCode = errorStatusCode(error);
    if (staleSubscription(statusCode)) {
      await db
        .delete(notificationSubscriptionsTable)
        .where(
          and(
            eq(notificationSubscriptionsTable.id, subscription.id),
            eq(notificationSubscriptionsTable.companyId, scope.companyId),
            eq(notificationSubscriptionsTable.userId, scope.userId),
          ),
        );
      logger.info(
        { subscriptionId: subscription.id, statusCode },
        "Removed expired Web Push subscription",
      );
      return "removed";
    }

    logger.warn(
      { err: error, subscriptionId: subscription.id, statusCode },
      "Web Push delivery failed",
    );
    throw error;
  }
}

export async function sendWebPushNotification(
  scope: NotificationScope,
  content: NotificationContent,
): Promise<NotificationDeliveryResult> {
  ensureVapidConfigured();

  const subscriptions = await db
    .select()
    .from(notificationSubscriptionsTable)
    .where(subscriptionWhere(scope));

  const settled = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendToSubscription(subscription, content, scope),
    ),
  );

  let delivered = 0;
  let removed = 0;
  let failed = 0;
  for (const result of settled) {
    if (result.status === "fulfilled" && result.value === "delivered") {
      delivered += 1;
    } else if (result.status === "fulfilled" && result.value === "removed") {
      removed += 1;
    } else {
      failed += 1;
    }
  }

  return {
    attempted: subscriptions.length,
    delivered,
    removed,
    failed,
  };
}

export async function createNotificationAndPush(
  scope: NotificationScope,
  content: NotificationContent,
): Promise<{
  notification: Notification;
  delivery: NotificationDeliveryResult;
}> {
  const notification = await saveNotification(scope, content);
  const delivery = await sendWebPushNotification(scope, content);
  return { notification, delivery };
}

export async function listNotifications(
  options: NotificationListOptions,
): Promise<NotificationListResult> {
  const offset = (options.page - 1) * options.pageSize;
  const where = notificationWhere(options);
  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(notificationsTable)
      .where(where)
      .orderBy(desc(notificationsTable.createdAt))
      .limit(options.pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(notificationsTable)
      .where(where),
  ]);

  const totalCount = Number(total ?? 0);
  return {
    items,
    page: options.page,
    pageSize: options.pageSize,
    total: totalCount,
    totalPages: Math.ceil(totalCount / options.pageSize),
  };
}

export async function markNotificationRead(
  scope: NotificationScope,
  notificationId: string,
  isRead = true,
): Promise<Notification | null> {
  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead })
    .where(notificationWhere(scope, notificationId))
    .returning();
  return notification ?? null;
}

export async function saveNotificationSubscription(
  input: NotificationSubscriptionInput,
): Promise<NotificationSubscription> {
  const [existing] = await db
    .select()
    .from(notificationSubscriptionsTable)
    .where(eq(notificationSubscriptionsTable.endpoint, input.endpoint))
    .limit(1);

  if (existing) {
    if (
      existing.companyId !== input.companyId ||
      existing.userId !== input.userId
    ) {
      throw new NotificationSubscriptionConflictError();
    }

    const [updated] = await db
      .update(notificationSubscriptionsTable)
      .set({
        auth: input.auth,
        p256dh: input.p256dh,
        userAgent: input.userAgent ?? null,
      })
      .where(subscriptionWhere(input, input.endpoint))
      .returning();
    if (updated) return updated;
  }

  try {
    const [created] = await db
      .insert(notificationSubscriptionsTable)
      .values({
        companyId: input.companyId,
        userId: input.userId,
        endpoint: input.endpoint,
        auth: input.auth,
        p256dh: input.p256dh,
        userAgent: input.userAgent,
      })
      .returning();
    if (!created) {
      throw new NotificationServiceError(
        500,
        "NOTIFICATION_SUBSCRIPTION_SAVE_FAILED",
        "The push subscription could not be saved.",
      );
    }
    return created;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new NotificationSubscriptionConflictError();
    }
    logger.error(
      { err: error, companyId: input.companyId, userId: input.userId },
      "Failed to save Web Push subscription",
    );
    throw error;
  }
}

export async function removeNotificationSubscription(
  scope: NotificationScope,
  endpoint: string,
): Promise<boolean> {
  const deleted = await db
    .delete(notificationSubscriptionsTable)
    .where(subscriptionWhere(scope, endpoint))
    .returning({ id: notificationSubscriptionsTable.id });
  return deleted.length > 0;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}