---
name: Backup restore compatibility
description: Compatibility rule for restoring snapshots across schema versions.
---

Restore code uses PostgreSQL `jsonb_populate_record`, which fills omitted JSON
columns with `NULL` rather than applying the table default. Any new `NOT NULL`
column can therefore break older backup files during restore.

**Why:** An older backup without a newly added localized company name column
failed during restore even though the column has a database default.

**How to apply:** Keep restore-only normalization for newly added required
columns, deriving localized fallbacks from existing names where appropriate.
Do not mutate the uploaded payload or its checksum; normalize only the row sent
to the database.