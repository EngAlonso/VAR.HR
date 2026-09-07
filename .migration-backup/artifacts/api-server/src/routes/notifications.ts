import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  createNotificationAndPush,
  listNotifications,
  markNotificationRead,
  NotificationServiceError,
  removeNotificationSubscription,
  saveNotificationSubscription,
} from "../services/notificationService";
import {
  WorkspaceAccessError,
  WorkspaceAuthError,
  getTenantContext,
} from "../lib/tenant-context";

const router: IRouter = Router();

const subscriptionSchema = z
  .object({
    endpoint: z.string().trim().url().max(2048),
    auth: z.string().trim().min(1).max(512),
    p256dh: z.string().trim().min(1).max(512),
    userAgent: z.string().trim().max(1024).optional(),
  })
  .strict();

const notificationSchema = z
  .object({
    type: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    message: z.string().trim().min(1).max(2_000),
    data: z.record(z.string(), z.unknown()).default({}),
    icon: z.string().trim().min(1).max(2_048).optional(),
    badge: z.string().trim().min(1).max(2_048).optional(),
    tag: z.string().trim().min(1).max(128).optional(),
  })
  .strict();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const readSchema = z
  .object({
    isRead: z.boolean().default(true),
  })
  .strict();

const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

function validationError(error: z.ZodError): {
  error: string;
  code: string;
  details: z.core.$ZodIssue[];
} {
  return {
    error: "The request contains invalid data.",
    code: "INVALID_REQUEST",
    details: error.issues,
  };
}

function errorResponse(error: unknown): {
  status: number;
  body: Record<string, unknown>;
} {
  if (error instanceof WorkspaceAuthError || error instanceof WorkspaceAccessError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code },
    };
  }
  if (error instanceof NotificationServiceError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code },
    };
  }
  return {
    status: 500,
    body: {
      error: "An unexpected notification error occurred.",
      code: "NOTIFICATION_INTERNAL_ERROR",
    },
  };
}

function logAndRespond(
  error: unknown,
  req: Request,
  res: Response,
): void {
  const response = errorResponse(error);
  if (response.status >= 500) {
    req.log.error({ err: error }, "Notification endpoint failed");
  } else {
    req.log.warn({ err: error }, "Notification request rejected");
  }
  res.status(response.status).json(response.body);
}

function serializedNotification(notification: {
  id: string;
  companyId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: unknown;
  isRead: boolean;
  createdAt: Date;
}) {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  };
}

router.post("/notifications/subscribe", async (req, res): Promise<void> => {
  try {
    const parsed = subscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(validationError(parsed.error));
      return;
    }
    const context = await getTenantContext(req);
    const subscription = await saveNotificationSubscription({
      ...parsed.data,
      companyId: context.companyId,
      userId: context.accountId,
    });
    res.status(201).json({
      subscription: {
        id: subscription.id,
        endpoint: subscription.endpoint,
        createdAt: subscription.createdAt.toISOString(),
      },
    });
  } catch (error) {
    logAndRespond(error, req, res);
  }
});

router.post("/notifications/unsubscribe", async (req, res): Promise<void> => {
  try {
    const parsed = z
      .object({ endpoint: z.string().trim().url().max(2_048) })
      .strict()
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(validationError(parsed.error));
      return;
    }
    const context = await getTenantContext(req);
    const removed = await removeNotificationSubscription(
      {
        companyId: context.companyId,
        userId: context.accountId,
      },
      parsed.data.endpoint,
    );
    res.status(removed ? 200 : 404).json({
      removed,
      message: removed
        ? "The push subscription was removed."
        : "The push subscription was not found for this account.",
    });
  } catch (error) {
    logAndRespond(error, req, res);
  }
});

router.get("/notifications", async (req, res): Promise<void> => {
  try {
    const parsed = paginationSchema.safeParse({
      page: req.query.page ?? 1,
      pageSize: req.query.pageSize ?? 20,
    });
    if (!parsed.success) {
      res.status(400).json(validationError(parsed.error));
      return;
    }
    const context = await getTenantContext(req);
    const result = await listNotifications({
      companyId: context.companyId,
      userId: context.accountId,
      ...parsed.data,
    });
    res.json({
      ...result,
      items: result.items.map(serializedNotification),
    });
  } catch (error) {
    logAndRespond(error, req, res);
  }
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  try {
    const id = notificationIdSchema.safeParse(req.params);
    const body = readSchema.safeParse(req.body ?? {});
    if (!id.success) {
      res.status(400).json(validationError(id.error));
      return;
    }
    if (!body.success) {
      res.status(400).json(validationError(body.error));
      return;
    }
    const context = await getTenantContext(req);
    const notification = await markNotificationRead(
      {
        companyId: context.companyId,
        userId: context.accountId,
      },
      id.data.id,
      body.data.isRead,
    );
    if (!notification) {
      res.status(404).json({
        error: "Notification not found for this account.",
        code: "NOTIFICATION_NOT_FOUND",
      });
      return;
    }
    res.json(serializedNotification(notification));
  } catch (error) {
    logAndRespond(error, req, res);
  }
});

router.post("/notifications/send", async (req, res): Promise<void> => {
  try {
    const parsed = notificationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(validationError(parsed.error));
      return;
    }
    const context = await getTenantContext(req);
    if (
      context.role !== "company_owner" &&
      context.role !== "platform_owner"
    ) {
      throw new WorkspaceAccessError(
        "Only workspace owners can send manual test notifications.",
      );
    }
    const result = await createNotificationAndPush(
      {
        companyId: context.companyId,
        userId: context.accountId,
      },
      parsed.data,
    );
    res.status(201).json({
      notification: serializedNotification(result.notification),
      delivery: result.delivery,
    });
  } catch (error) {
    logAndRespond(error, req, res);
  }
});

export default router;