---
name: Backup restore referential integrity
description: Constraints for restoring scoped data while preserving backup records and audit history.
---

Scoped restores preserve backup records, so backup-record foreign keys can prevent deletion of tenant accounts or companies. Backup payload checksums must also canonicalize persisted JSONB values, including Date values as ISO strings.

**Why:** PostgreSQL JSONB can reorder keys, and surviving backup records reference the accounts and companies involved in a restore.

**How to apply:** Keep checksum serialization stable across the database round trip; include authentication audit events in company scope; preserve referenced company/platform rows or reassign surviving backup creators before deleting tenant accounts.