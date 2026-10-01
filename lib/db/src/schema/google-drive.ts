import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userAccountsTable } from "./auth";

/**
 * Platform-wide Google Drive connection used only by scheduled backup uploads.
 * Tokens and OAuth state are deliberately excluded from backup payloads.
 */
export const googleDriveConnectionTable = pgTable(
  "var_hr_google_drive_connection",
  {
    id: text("id").primaryKey().default("default"),
    refreshTokenCiphertext: text("refresh_token_ciphertext"),
    connectedEmail: text("connected_email"),
    connectedBy: uuid("connected_by").references(() => userAccountsTable.id, {
      onDelete: "set null",
    }),
    connectedAt: timestamp("connected_at", { withTimezone: true }),
    driveFolderId: text("drive_folder_id"),
    driveFolderWebViewLink: text("drive_folder_web_view_link"),
    oauthStateHash: text("oauth_state_hash"),
    oauthStateAccountId: uuid("oauth_state_account_id").references(
      () => userAccountsTable.id,
      { onDelete: "set null" },
    ),
    oauthStateExpiresAt: timestamp("oauth_state_expires_at", {
      withTimezone: true,
    }),
    oauthReturnTo: text("oauth_return_to"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export type GoogleDriveConnection =
  typeof googleDriveConnectionTable.$inferSelect;