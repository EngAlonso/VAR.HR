import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db, googleDriveConnectionTable } from "@workspace/db";

const CONNECTION_ID = "default";
const OAUTH_STATE_TTL_MS = 10 * 60_000;
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const USER_INFO_SCOPE = "openid email";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type GoogleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
};

type GoogleUserInfo = {
  email?: string;
};

export class GoogleDriveOAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "GoogleDriveOAuthError";
    this.code = code;
  }
}

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function encryptionKey(): Buffer | null {
  const value = env("GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY");
  if (!value) return null;
  const key = Buffer.from(value, "base64");
  return key.length === 32 ? key : null;
}

export function isGoogleDriveOAuthConfigured(): boolean {
  return Boolean(
    env("GOOGLE_DRIVE_CLIENT_ID") &&
      env("GOOGLE_DRIVE_CLIENT_SECRET") &&
      env("GOOGLE_DRIVE_REDIRECT_URI") &&
      encryptionKey(),
  );
}

function assertConfigured(): void {
  if (!env("GOOGLE_DRIVE_CLIENT_ID") || !env("GOOGLE_DRIVE_CLIENT_SECRET")) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_OAUTH_NOT_CONFIGURED",
      "Google Drive OAuth credentials are not configured on this deployment.",
    );
  }
  if (!env("GOOGLE_DRIVE_REDIRECT_URI")) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_REDIRECT_URI_NOT_CONFIGURED",
      "The Google Drive OAuth callback URL is not configured on this deployment.",
    );
  }
  if (!encryptionKey()) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_TOKEN_KEY_NOT_CONFIGURED",
      "The Google Drive token encryption key is missing or invalid.",
    );
  }
}

function hashState(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function encryptRefreshToken(refreshToken: string): string {
  const key = encryptionKey();
  if (!key) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_TOKEN_KEY_NOT_CONFIGURED",
      "The Google Drive token encryption key is missing or invalid.",
    );
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptRefreshToken(value: string): string {
  const key = encryptionKey();
  const [version, ivText, tagText, ciphertextText] = value.split(".");
  if (
    !key ||
    version !== "v1" ||
    !ivText ||
    !tagText ||
    !ciphertextText
  ) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_TOKEN_DECRYPTION_FAILED",
      "The stored Google Drive connection cannot be decrypted.",
    );
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivText, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new GoogleDriveOAuthError(
      "GOOGLE_TOKEN_DECRYPTION_FAILED",
      "The stored Google Drive connection cannot be decrypted.",
    );
  }
}

async function parseGoogleJson<T>(
  response: Response,
  code: string,
): Promise<T> {
  if (!response.ok) {
    throw new GoogleDriveOAuthError(
      `${code}_HTTP_${response.status}`,
      `Google authorization failed (${response.status}).`,
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new GoogleDriveOAuthError(
      `${code}_INVALID_RESPONSE`,
      "Google returned an invalid authorization response.",
    );
  }
}

async function exchangeAuthorizationCode(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: env("GOOGLE_DRIVE_CLIENT_SECRET"),
      redirect_uri: env("GOOGLE_DRIVE_REDIRECT_URI"),
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  return parseGoogleJson<GoogleTokenResponse>(response, "GOOGLE_TOKEN_EXCHANGE");
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
  });
  return parseGoogleJson<GoogleUserInfo>(response, "GOOGLE_USER_INFO");
}

export async function createGoogleDriveAuthorizationUrl(input: {
  accountId: string;
  returnTo: string;
}): Promise<string> {
  assertConfigured();
  const state = randomBytes(32).toString("base64url");
  const now = new Date();
  await db
    .insert(googleDriveConnectionTable)
    .values({
      id: CONNECTION_ID,
      oauthStateHash: hashState(state),
      oauthStateAccountId: input.accountId,
      oauthStateExpiresAt: new Date(now.getTime() + OAUTH_STATE_TTL_MS),
      oauthReturnTo: input.returnTo,
    })
    .onConflictDoUpdate({
      target: googleDriveConnectionTable.id,
      set: {
        oauthStateHash: hashState(state),
        oauthStateAccountId: input.accountId,
        oauthStateExpiresAt: new Date(now.getTime() + OAUTH_STATE_TTL_MS),
        oauthReturnTo: input.returnTo,
        updatedAt: now,
      },
    });

  const authorization = new URL(GOOGLE_AUTH_URL);
  authorization.search = new URLSearchParams({
    client_id: env("GOOGLE_DRIVE_CLIENT_ID"),
    redirect_uri: env("GOOGLE_DRIVE_REDIRECT_URI"),
    response_type: "code",
    scope: `${DRIVE_SCOPE} ${USER_INFO_SCOPE}`,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  }).toString();
  return authorization.toString();
}

export async function consumeGoogleDriveOAuthState(input: {
  state: string;
  accountId: string;
}) {
  const [stored] = await db
    .update(googleDriveConnectionTable)
    .set({
      oauthStateHash: null,
      oauthStateAccountId: null,
      oauthStateExpiresAt: null,
      oauthReturnTo: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(googleDriveConnectionTable.id, CONNECTION_ID),
        eq(googleDriveConnectionTable.oauthStateHash, hashState(input.state)),
        eq(googleDriveConnectionTable.oauthStateAccountId, input.accountId),
        gt(googleDriveConnectionTable.oauthStateExpiresAt, new Date()),
      ),
    )
    .returning({
      returnTo: googleDriveConnectionTable.oauthReturnTo,
      connectedEmail: googleDriveConnectionTable.connectedEmail,
      driveFolderId: googleDriveConnectionTable.driveFolderId,
      driveFolderWebViewLink:
        googleDriveConnectionTable.driveFolderWebViewLink,
    });
  if (!stored) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_OAUTH_STATE_INVALID",
      "The Google authorization request expired or could not be verified.",
    );
  }
  return stored;
}

export async function completeGoogleDriveAuthorization(input: {
  accountId: string;
  code: string;
  existingEmail: string | null;
  existingFolderId: string | null;
  existingFolderUrl: string | null;
}): Promise<{ connectedEmail: string }> {
  assertConfigured();
  const token = await exchangeAuthorizationCode(input.code);
  if (!token.access_token || !token.refresh_token) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_REFRESH_TOKEN_MISSING",
      "Google did not provide an offline access grant. Try connecting again.",
    );
  }
  const profile = await fetchGoogleUserInfo(token.access_token);
  const connectedEmail =
    typeof profile.email === "string" ? profile.email.trim() : "";
  if (!connectedEmail) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_EMAIL_MISSING",
      "Google did not provide the authorized account email.",
    );
  }

  const sameAccount =
    input.existingEmail?.toLowerCase() === connectedEmail.toLowerCase();
  await db
    .insert(googleDriveConnectionTable)
    .values({
      id: CONNECTION_ID,
      refreshTokenCiphertext: encryptRefreshToken(token.refresh_token),
      connectedEmail,
      connectedBy: input.accountId,
      connectedAt: new Date(),
      driveFolderId: sameAccount ? input.existingFolderId : null,
      driveFolderWebViewLink: sameAccount ? input.existingFolderUrl : null,
    })
    .onConflictDoUpdate({
      target: googleDriveConnectionTable.id,
      set: {
        refreshTokenCiphertext: encryptRefreshToken(token.refresh_token),
        connectedEmail,
        connectedBy: input.accountId,
        connectedAt: new Date(),
        driveFolderId: sameAccount ? input.existingFolderId : null,
        driveFolderWebViewLink: sameAccount ? input.existingFolderUrl : null,
        updatedAt: new Date(),
      },
    });
  return { connectedEmail };
}

export async function getGoogleDriveConnection() {
  const [connection] = await db
    .select()
    .from(googleDriveConnectionTable)
    .where(eq(googleDriveConnectionTable.id, CONNECTION_ID))
    .limit(1);
  return connection;
}

export async function getGoogleDriveAccessToken(): Promise<string> {
  assertConfigured();
  const connection = await getGoogleDriveConnection();
  if (!connection?.refreshTokenCiphertext) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_DRIVE_NOT_CONNECTED",
      "Google Drive is not connected.",
    );
  }
  const refreshToken = decryptRefreshToken(connection.refreshTokenCiphertext);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env("GOOGLE_DRIVE_CLIENT_ID"),
      client_secret: env("GOOGLE_DRIVE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const token = await parseGoogleJson<GoogleTokenResponse>(
    response,
    "GOOGLE_TOKEN_REFRESH",
  );
  if (!token.access_token) {
    throw new GoogleDriveOAuthError(
      "GOOGLE_ACCESS_TOKEN_MISSING",
      "Google did not return an access token.",
    );
  }
  if (token.refresh_token) {
    await db
      .update(googleDriveConnectionTable)
      .set({
        refreshTokenCiphertext: encryptRefreshToken(token.refresh_token),
        updatedAt: new Date(),
      })
      .where(eq(googleDriveConnectionTable.id, CONNECTION_ID));
  }
  return token.access_token;
}

export async function disconnectGoogleDrive(): Promise<void> {
  const connection = await getGoogleDriveConnection();
  if (connection?.refreshTokenCiphertext) {
    try {
      const refreshToken = decryptRefreshToken(
        connection.refreshTokenCiphertext,
      );
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: refreshToken }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      // Revoke is best effort; disconnecting in the app must always succeed.
    }
  }
  await db
    .update(googleDriveConnectionTable)
    .set({
      refreshTokenCiphertext: null,
      connectedBy: null,
      connectedAt: null,
      oauthStateHash: null,
      oauthStateAccountId: null,
      oauthStateExpiresAt: null,
      oauthReturnTo: null,
      updatedAt: new Date(),
    })
    .where(eq(googleDriveConnectionTable.id, CONNECTION_ID));
}

export function googleDriveErrorCode(error: unknown): string {
  return error instanceof GoogleDriveOAuthError
    ? error.code
    : "GOOGLE_DRIVE_REQUEST_FAILED";
}