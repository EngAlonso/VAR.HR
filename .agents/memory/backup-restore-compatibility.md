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
to the database. Keep backup table coverage aligned with every database schema
table; require a coverage test to fail when a table is neither included nor
explicitly excluded, and review tenant scope and foreign-key order for each
addition.

When restoring rows with explicit values for a serial column, synchronize its
sequence without moving it below either the restored maximum or its previous
position. Preserve queued device commands as queued; repeat LOG requests can be
sent on the next device poll, and attendance ingestion must remain idempotent.

**Why:** Explicit inserts do not advance PostgreSQL sequences, while queued
device commands are active state rather than disposable history.

**How to apply:** Add sequence reconciliation to restores that include serial
columns, and keep device event ingestion deduplicated when command state is
restored.

Company backups may contain authentication audit events whose actor account is
not present in the target database, especially when a backup moves between
environments. Since the actor reference is optional, retain the audit event and
clear only that missing account reference rather than aborting the restore.

**Why:** An absent actor account caused a foreign-key violation that rolled back
an otherwise valid company restore.

**How to apply:** After restoring user accounts and before inserting
authentication audit events, compare actor IDs with the accounts present in the
target. Keep valid IDs and set missing optional IDs to null on the row copy.