---
name: Google Drive folder access
description: OAuth scope needed to locate the existing VAR HR backup folder when its stored ID is missing.
---

Google Drive backup authorization must be able to locate the existing `VAR HR Backups` folder, including after a database migration loses the stored folder ID. The `drive.file` scope cannot reliably find a pre-existing folder; use the full Drive scope for this integration and require the platform owner to reconnect after scope changes.

**Why:** A retry failed with HTTP 403 during folder search after the database changed, even though the backup folder still existed in the connected account.

**How to apply:** Keep the Drive authorization scope consistent with folder discovery and upload behavior. Be explicit that changing the scope requires OAuth reconnection and broader Google Drive consent.
