---
name: Drizzle migration snapshots
description: Safe migration generation when migration SQL and snapshots have different histories.
---

Keep Drizzle's migration output path relative. When migration files have been maintained without matching intermediate snapshots, `generate` compares against the last available snapshot and may emit creates for unrelated tables that are already present in the application schema. Review generated SQL against the intended schema change, and keep the migration journal and latest snapshot consistent.

**Why:** The workspace's existing migration history had manual SQL entries without intermediate snapshots, so a new generated migration included unrelated HR tables. An absolute output path also produced a malformed migration metadata path; a relative output path worked.

**How to apply:** Before generating a migration, inspect the journal and available snapshots. Narrow any generated SQL to the intended additive change rather than applying unrelated table creation statements.