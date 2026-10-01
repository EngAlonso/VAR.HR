import { Router, type IRouter, type Request, type Response } from "express";
import { writeAuthAudit } from "../lib/auth";
import {
  completeGoogleDriveAuthorization,
  consumeGoogleDriveOAuthState,
  createGoogleDriveAuthorizationUrl,
  disconnectGoogleDrive,
  getGoogleDriveConnection,
  googleDriveErrorCode,
  GoogleDriveOAuthError,
} from "../lib/google-drive-auth";
import {
  googleDriveBackupStatus,
  retryPendingGoogleDriveBackups,
} from "../lib/google-drive-backups";
import { logger } from "../lib/logger";
import { requirePlatformOwner } from "../lib/tenant-context";

const router: IRouter = Router();

function queryString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function safeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 1_024 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return "/";
  }
  return value;
}

function returnWithResult(returnTo: string, result: string): string {
  const target = new URL(returnTo, "https://var-hr.invalid");
  target.searchParams.set("drive", result);
  return `${target.pathname}${target.search}${target.hash}`;
}

router.get("/platform/google-drive", async (req, res): Promise<void> => {
  await requirePlatformOwner(req);
  res.json(await googleDriveBackupStatus());
});

router.get(
  "/platform/google-drive/oauth/start",
  async (req: Request, res: Response): Promise<void> => {
    const context = await requirePlatformOwner(req);
    try {
      const authorizationUrl = await createGoogleDriveAuthorizationUrl({
        accountId: context.accountId,
        returnTo: safeReturnTo(req.query.returnTo),
      });
      res.redirect(302, authorizationUrl);
    } catch (error) {
      if (error instanceof GoogleDriveOAuthError) {
        res.status(503).json({ error: error.message, code: error.code });
        return;
      }
      throw error;
    }
  },
);

router.get(
  "/platform/google-drive/oauth/callback",
  async (req: Request, res: Response): Promise<void> => {
    const context = await requirePlatformOwner(req);
    const state = queryString(req.query.state);
    if (!state) {
      res.status(400).json({ error: "The Google authorization state is missing." });
      return;
    }

    let returnTo = "/";
    try {
      const storedState = await consumeGoogleDriveOAuthState({
        state,
        accountId: context.accountId,
      });
      returnTo = safeReturnTo(storedState.returnTo);
      const providerError = queryString(req.query.error);
      if (providerError) {
        res.redirect(303, returnWithResult(returnTo, "cancelled"));
        return;
      }

      const code = queryString(req.query.code);
      if (!code) {
        res.redirect(303, returnWithResult(returnTo, "error"));
        return;
      }
      const connection = await completeGoogleDriveAuthorization({
        accountId: context.accountId,
        code,
        existingEmail: storedState.connectedEmail,
        existingFolderId: storedState.driveFolderId,
        existingFolderUrl: storedState.driveFolderWebViewLink,
      });
      await writeAuthAudit({
        accountId: context.accountId,
        companyId: null,
        action: "google_drive_backup_connected",
        entityType: "google_drive_connection",
        entityId: "default",
        metadata: { connectedEmail: connection.connectedEmail },
      });
      res.redirect(303, returnWithResult(returnTo, "connected"));
    } catch (error) {
      logger.warn(
        { errorCode: googleDriveErrorCode(error) },
        "Google Drive authorization did not complete",
      );
      res.redirect(303, returnWithResult(returnTo, "error"));
    }
  },
);

router.delete("/platform/google-drive", async (req, res): Promise<void> => {
  const context = await requirePlatformOwner(req);
  const connection = await getGoogleDriveConnection();
  await disconnectGoogleDrive();
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: null,
    action: "google_drive_backup_disconnected",
    entityType: "google_drive_connection",
    entityId: "default",
    metadata: {
      connectedEmail: connection?.connectedEmail ?? null,
    },
  });
  res.status(204).send();
});

router.post(
  "/platform/google-drive/retry",
  async (req, res): Promise<void> => {
    const context = await requirePlatformOwner(req);
    const result = await retryPendingGoogleDriveBackups({ force: true });
    await writeAuthAudit({
      accountId: context.accountId,
      companyId: null,
      action: "google_drive_backup_retry_requested",
      entityType: "google_drive_connection",
      entityId: "default",
      metadata: {
        processed: result.processed,
        uploaded: result.uploaded,
        failed: result.failed,
        pending: result.pending,
      },
    });
    res.json(result);
  },
);

export default router;