import { desc, and, eq, sql } from "drizzle-orm";
import {
  backupRecordsTable,
  db,
  googleDriveConnectionTable,
} from "@workspace/db";
import {
  getGoogleDriveAccessToken,
  getGoogleDriveConnection,
  googleDriveErrorCode,
  isGoogleDriveOAuthConfigured,
} from "./google-drive-auth";
import { logger } from "./logger";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const BACKUP_FOLDER_NAME = "VAR HR Backups";
const MAX_UPLOADS_PER_TICK = 10;

type BackupRecord = typeof backupRecordsTable.$inferSelect;
type DriveFile = {
  id?: string;
  name?: string;
  webViewLink?: string;
  mimeType?: string;
  trashed?: boolean;
};
type DriveUploadMetadata = {
  state?: string;
  attempts?: number;
  nextAttemptAt?: string;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  uploadedAt?: string;
  lastErrorCode?: string;
};
type JsonObject = Record<string, unknown>;

class GoogleDriveApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly operation: string;

  constructor(status: number, operation: string, reason?: string) {
    super(`Google Drive API request failed (${status}).`);
    this.name = "GoogleDriveApiError";
    this.status = status;
    this.operation = operation;
    this.code = [
      "GOOGLE_DRIVE_API",
      `HTTP_${status}`,
      operation,
      reason,
    ]
      .filter(Boolean)
      .join("_");
  }
}

function recordObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function errorCodePart(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

async function driveApiError(
  response: Response,
  operation: string,
): Promise<GoogleDriveApiError> {
  let reason: string | undefined;
  try {
    const body = recordObject(await response.clone().json());
    const error = recordObject(body.error);
    const details = Array.isArray(error.errors) ? error.errors : [];
    const firstDetail = recordObject(details[0]);
    const candidate =
      typeof firstDetail.reason === "string"
        ? firstDetail.reason
        : typeof error.status === "string"
          ? error.status
          : "";
    if (candidate) reason = errorCodePart(candidate) || undefined;
  } catch {
    // Some Google endpoints return a non-JSON body for errors.
  }
  return new GoogleDriveApiError(response.status, operation, reason);
}

function driveMetadata(record: BackupRecord): DriveUploadMetadata {
  return recordObject(record.metadata).googleDrive as
    | DriveUploadMetadata
    | undefined ?? {};
}

function escapeDriveQuery(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

async function driveJson<T>(
  accessToken: string,
  url: string,
  operation: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw await driveApiError(response, operation);
  try {
    return (await response.json()) as T;
  } catch {
    throw new GoogleDriveApiError(502, operation);
  }
}

async function persistFolder(file: DriveFile): Promise<void> {
  if (!file.id) throw new GoogleDriveApiError(502, "PERSIST_BACKUP_FOLDER");
  await db
    .update(googleDriveConnectionTable)
    .set({
      driveFolderId: file.id,
      driveFolderWebViewLink: file.webViewLink ?? null,
      updatedAt: new Date(),
    })
    .where(eq(googleDriveConnectionTable.id, "default"));
}

async function createBackupFolder(accessToken: string): Promise<DriveFile> {
  const folder = await driveJson<DriveFile>(
    accessToken,
    `${DRIVE_API}/files?fields=id,name,webViewLink,mimeType`,
    "CREATE_BACKUP_FOLDER",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: BACKUP_FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
        description:
          "Scheduled VAR HR database backups. These files contain sensitive employee and business data.",
      }),
    },
  );
  await persistFolder(folder);
  return folder;
}

async function ensureBackupFolder(
  accessToken: string,
): Promise<DriveFile> {
  const connection = await getGoogleDriveConnection();
  if (connection?.driveFolderId) {
    try {
      const folder = await driveJson<DriveFile>(
        accessToken,
        `${DRIVE_API}/files/${encodeURIComponent(connection.driveFolderId)}?fields=id,name,webViewLink,mimeType,trashed`,
        "GET_BACKUP_FOLDER",
      );
      if (
        folder.id &&
        folder.mimeType === "application/vnd.google-apps.folder" &&
        !folder.trashed
      ) {
        return folder;
      }
      if (!folder.trashed) {
        throw new GoogleDriveApiError(400, "VALIDATE_BACKUP_FOLDER");
      }
    } catch (error) {
      if (!(error instanceof GoogleDriveApiError) || error.status !== 404) {
        throw error;
      }
    }
  }
  return createBackupFolder(accessToken);
}

async function findExistingBackupFile(
  accessToken: string,
  folderId: string,
  backupId: string,
): Promise<DriveFile | null> {
  const query = [
    `'${escapeDriveQuery(folderId)}' in parents`,
    `appProperties has { key='backupRecordId' and value='${escapeDriveQuery(backupId)}' }`,
    "trashed = false",
  ].join(" and ");
  const params = new URLSearchParams({
    q: query,
    pageSize: "10",
    fields: "files(id,name,webViewLink,mimeType)",
  });
  const result = await driveJson<{ files?: DriveFile[] }>(
    accessToken,
    `${DRIVE_API}/files?${params.toString()}`,
    "FIND_EXISTING_BACKUP",
  );
  return result.files?.find((file) => Boolean(file.id)) ?? null;
}

function driveFilename(record: BackupRecord): string {
  const isoTimestamp = record.createdAt.toISOString();
  const date = isoTimestamp.slice(0, 10);
  const time = isoTimestamp.slice(11, 19).replaceAll(":", "-");
  return `VAR-HR-${date}_${time}Z.json`;
}

async function uploadJsonFile(
  accessToken: string,
  input: {
    name: string;
    folderId: string;
    backupId: string;
    contents: string;
  },
): Promise<DriveFile> {
  const content = Buffer.from(input.contents, "utf8");
  const sessionResponse = await fetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=resumable&fields=id,name,webViewLink,mimeType`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "application/json",
        "X-Upload-Content-Length": String(content.byteLength),
      },
      body: JSON.stringify({
        name: input.name,
        mimeType: "application/json",
        parents: [input.folderId],
        appProperties: { backupRecordId: input.backupId },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!sessionResponse.ok) {
    throw await driveApiError(sessionResponse, "START_BACKUP_UPLOAD");
  }
  const uploadUrl = sessionResponse.headers.get("location");
  if (!uploadUrl) throw new GoogleDriveApiError(502, "START_BACKUP_UPLOAD");

  return driveJson<DriveFile>(accessToken, uploadUrl, "UPLOAD_BACKUP_CONTENT", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: content,
  });
}

async function markUploaded(
  record: BackupRecord,
  file: DriveFile,
): Promise<void> {
  if (!file.id) throw new GoogleDriveApiError(502, "PERSIST_UPLOADED_BACKUP");
  const metadata = recordObject(record.metadata);
  const current = driveMetadata(record);
  await db
    .update(backupRecordsTable)
    .set({
      metadata: {
        ...metadata,
        googleDrive: {
          state: "uploaded",
          attempts: (current.attempts ?? 0) + 1,
          fileId: file.id,
          fileName: file.name ?? driveFilename(record),
          webViewLink: file.webViewLink ?? "",
          uploadedAt: new Date().toISOString(),
        },
      },
    })
    .where(eq(backupRecordsTable.id, record.id));
}

function retryDelayMinutes(attempt: number): number {
  return Math.min(360, 5 * 2 ** Math.min(Math.max(attempt - 1, 0), 6));
}

async function markUploadFailed(
  record: BackupRecord,
  error: unknown,
): Promise<string> {
  const metadata = recordObject(record.metadata);
  const current = driveMetadata(record);
  const attempts = (current.attempts ?? 0) + 1;
  const code = googleDriveErrorCode(error);
  const nextAttemptAt = new Date(
    Date.now() + retryDelayMinutes(attempts) * 60_000,
  ).toISOString();
  await db
    .update(backupRecordsTable)
    .set({
      metadata: {
        ...metadata,
        googleDrive: {
          state: "failed",
          attempts,
          nextAttemptAt,
          lastErrorCode: code,
        },
      },
    })
    .where(eq(backupRecordsTable.id, record.id));
  logger.warn(
    { backupId: record.id, errorCode: code, attempts },
    "Scheduled backup could not be copied to Google Drive",
  );
  return code;
}

export async function uploadScheduledBackupToGoogleDrive(
  record: BackupRecord,
): Promise<{ uploaded: boolean; errorCode?: string }> {
  if (
    record.metadata == null ||
    typeof record.metadata !== "object" ||
    !("creationMode" in record.metadata) ||
    record.metadata.creationMode !== "scheduled"
  ) {
    return { uploaded: false };
  }
  if (!isGoogleDriveOAuthConfigured()) return { uploaded: false };
  const connection = await getGoogleDriveConnection();
  if (!connection?.refreshTokenCiphertext) return { uploaded: false };

  try {
    const accessToken = await getGoogleDriveAccessToken();
    const folder = await ensureBackupFolder(accessToken);
    if (!folder.id) throw new GoogleDriveApiError(502, "VALIDATE_BACKUP_FOLDER");
    const existing = await findExistingBackupFile(
      accessToken,
      folder.id,
      record.id,
    );
    const file =
      existing ??
      (await uploadJsonFile(accessToken, {
        name: driveFilename(record),
        folderId: folder.id,
        backupId: record.id,
        contents: JSON.stringify(record.payload, null, 2),
      }));
    await markUploaded(record, file);
    return { uploaded: true };
  } catch (error) {
    return { uploaded: false, errorCode: await markUploadFailed(record, error) };
  }
}

async function pendingScheduledBackupsCount(): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(backupRecordsTable)
    .where(
      and(
        sql`${backupRecordsTable.metadata}->>'creationMode' = 'scheduled'`,
        sql`COALESCE(${backupRecordsTable.metadata}->'googleDrive'->>'state', 'pending') <> 'uploaded'`,
      ),
    );
  return result?.count ?? 0;
}

export async function retryPendingGoogleDriveBackups(input?: {
  force?: boolean;
}): Promise<{
  processed: number;
  uploaded: number;
  failed: number;
  pending: number;
  errorCodes: string[];
}> {
  if (!isGoogleDriveOAuthConfigured()) {
    return {
      processed: 0,
      uploaded: 0,
      failed: 0,
      pending: await pendingScheduledBackupsCount(),
      errorCodes: ["GOOGLE_OAUTH_NOT_CONFIGURED"],
    };
  }
  const connection = await getGoogleDriveConnection();
  if (!connection?.refreshTokenCiphertext) {
    return {
      processed: 0,
      uploaded: 0,
      failed: 0,
      pending: await pendingScheduledBackupsCount(),
      errorCodes: ["GOOGLE_DRIVE_NOT_CONNECTED"],
    };
  }

  const dueAttempt = input?.force
    ? sql`true`
    : sql`(
        ${backupRecordsTable.metadata}->'googleDrive'->>'nextAttemptAt' IS NULL
        OR (${backupRecordsTable.metadata}->'googleDrive'->>'nextAttemptAt')::timestamptz <= ${new Date()}
      )`;
  const records = await db
    .select()
    .from(backupRecordsTable)
    .where(
      and(
        sql`${backupRecordsTable.metadata}->>'creationMode' = 'scheduled'`,
        sql`COALESCE(${backupRecordsTable.metadata}->'googleDrive'->>'state', 'pending') <> 'uploaded'`,
        dueAttempt,
      ),
    )
    .orderBy(desc(backupRecordsTable.createdAt))
    .limit(MAX_UPLOADS_PER_TICK);

  let uploaded = 0;
  let failed = 0;
  const errorCodes = new Set<string>();
  for (const record of records) {
    const result = await uploadScheduledBackupToGoogleDrive(record);
    if (result.uploaded) uploaded += 1;
    else if (result.errorCode) {
      failed += 1;
      errorCodes.add(result.errorCode);
    }
  }
  return {
    processed: records.length,
    uploaded,
    failed,
    pending: await pendingScheduledBackupsCount(),
    errorCodes: [...errorCodes],
  };
}

export async function googleDriveBackupStatus() {
  const [connection] = await db
    .select({
      refreshTokenCiphertext:
        googleDriveConnectionTable.refreshTokenCiphertext,
      connectedEmail: googleDriveConnectionTable.connectedEmail,
      connectedAt: googleDriveConnectionTable.connectedAt,
      folderUrl: googleDriveConnectionTable.driveFolderWebViewLink,
    })
    .from(googleDriveConnectionTable)
    .where(eq(googleDriveConnectionTable.id, "default"))
    .limit(1);
  return {
    configured: isGoogleDriveOAuthConfigured(),
    connected: Boolean(connection?.refreshTokenCiphertext),
    connectedEmail: connection?.connectedEmail ?? null,
    connectedAt: connection?.connectedAt?.toISOString() ?? null,
    backupFolderUrl: connection?.folderUrl ?? null,
    pendingBackups: await pendingScheduledBackupsCount(),
  };
}