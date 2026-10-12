---
name: Google Drive backup scope
description: Which VAR HR backups may be copied to the platform owner's connected Google Drive.
---

Only scheduled `platform`-scope backups are copied to the platform owner's connected Google Drive. Company-scope backups remain available inside their own company account in VAR HR and must never be retried to the platform Drive. Do not remove historical company backup files already uploaded to Drive without explicit approval.

**Why:** The platform backup already contains the company data; company-specific backup files should stay in their own accounts rather than the platform owner's Drive.

**How to apply:** Enforce platform scope in direct upload and retry paths, and show Drive status or links only for platform backups.
