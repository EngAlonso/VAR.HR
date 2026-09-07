import { and, eq, or } from "drizzle-orm";
import {
  db,
  employeesTable,
  userAccountsTable,
} from "@workspace/db";
import { logger } from "../lib/logger";
import {
  saveNotification,
  sendWebPushNotification,
  type NotificationContent,
  type NotificationScope,
} from "./notificationService";

type LeaveNotificationDetails = {
  companyId: string;
  employeeId: string;
  employeeName: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason?: string | null;
};

async function deliverToRecipients(
  recipients: NotificationScope[],
  content: NotificationContent,
): Promise<void> {
  await Promise.allSettled(
    recipients.map(async (scope) => {
      try {
        await saveNotification(scope, content);
        try {
          await sendWebPushNotification(scope, content);
        } catch (error) {
          logger.warn(
            { err: error, companyId: scope.companyId, userId: scope.userId },
            "Automatic HR notification saved without Web Push delivery",
          );
        }
      } catch (error) {
        logger.error(
          { err: error, companyId: scope.companyId, userId: scope.userId },
          "Automatic HR notification could not be saved",
        );
      }
    }),
  );
}

async function companyApproverScopes(
  companyId: string,
): Promise<NotificationScope[]> {
  const accounts = await db
    .select({ id: userAccountsTable.id })
    .from(userAccountsTable)
    .leftJoin(
      employeesTable,
      eq(userAccountsTable.employeeId, employeesTable.id),
    )
    .where(
      and(
        eq(userAccountsTable.companyId, companyId),
        eq(userAccountsTable.active, true),
        or(
          eq(userAccountsTable.accountType, "company_owner"),
          eq(userAccountsTable.accountType, "manager"),
          eq(userAccountsTable.accountType, "staff"),
          eq(employeesTable.role, "manager"),
        ),
      ),
    );

  return accounts.map(({ id }) => ({ companyId, userId: id }));
}

async function employeeScope(
  companyId: string,
  employeeId: string,
): Promise<NotificationScope[]> {
  const accounts = await db
    .select({ id: userAccountsTable.id })
    .from(userAccountsTable)
    .where(
      and(
        eq(userAccountsTable.companyId, companyId),
        eq(userAccountsTable.employeeId, employeeId),
        eq(userAccountsTable.active, true),
      ),
    )
    .limit(1);

  return accounts.map(({ id }) => ({ companyId, userId: id }));
}

export async function notifyLeaveRequestCreated(
  details: LeaveNotificationDetails,
): Promise<void> {
  try {
    const recipients = await companyApproverScopes(details.companyId);
    await deliverToRecipients(recipients, {
      type: "leave_request",
      title: "New leave request",
      message: `${details.employeeName} submitted ${details.type} from ${details.from} to ${details.to}.`,
      data: {
        url: "/requests",
        employeeId: details.employeeId,
        requestType: details.type,
        days: details.days,
      },
      tag: `leave-request-${details.employeeId}`,
    });
  } catch (error) {
    logger.error(
      { err: error, companyId: details.companyId },
      "Leave request notification fan-out failed",
    );
  }
}

export async function notifyLeaveRequestDecision(
  details: LeaveNotificationDetails & {
    decision: "approved" | "rejected";
    decisionReason?: string | null;
  },
): Promise<void> {
  try {
    const recipients = await employeeScope(
      details.companyId,
      details.employeeId,
    );
    const decisionLabel =
      details.decision === "approved" ? "approved" : "rejected";
    await deliverToRecipients(recipients, {
      type: `leave_request_${details.decision}`,
      title: `Leave request ${decisionLabel}`,
      message: `Your ${details.type} request from ${details.from} to ${details.to} was ${decisionLabel}.`,
      data: {
        url: "/requests",
        employeeId: details.employeeId,
        requestType: details.type,
        decision: details.decision,
        decisionReason: details.decisionReason ?? null,
      },
      tag: `leave-decision-${details.employeeId}`,
    });
  } catch (error) {
    logger.error(
      { err: error, companyId: details.companyId, employeeId: details.employeeId },
      "Leave decision notification fan-out failed",
    );
  }
}