---
name: Drizzle migration snapshots
description: Safe migration generation when migration SQL and snapshots have different histories.
---

Keep Drizzle's migration output path relative. When migration files have been maintained without matching intermediate snapshots, `generate` compares against the last available snapshot and may emit creates for unrelated tables that are already present in the application schema. Review generated SQL against the intended schema change, and keep the migration journal and latest snapshot consistent.

**Why:** The workspace's existing migration history had manual SQL entries without intermediate snapshots, so a new generated migration included unrelated HR tables. An absolute output path also produced a malformed migration metadata path; a relative output path worked.

**How to apply:** Before generating a migration, inspect the journal and available snapshots. Narrow any generated SQL to the intended additive change rather than applying unrelated table creation statements.

The custom Aiven status report must not be parsed as a Drizzle snapshot. Keep migration generation routed through the package wrapper, which temporarily hides that report while Drizzle scans `migrations/meta`.

**Why:** Drizzle treats every JSON file in its metadata folder as a snapshot; the Aiven report is valid JSON but has a different shape, so direct `drizzle-kit generate` fails.

**How to apply:** Use `pnpm --filter @workspace/db run generate` instead of invoking Drizzle Kit directly.

This repository's historical migration SQL also omits creation statements for tables that existed before Drizzle history began. A clean development database must not replay that incomplete history. Bootstrap only a confirmed-empty Replit development database to its known `0009` schema, record the matching baseline, then apply pending migrations normally. Never edit committed historical SQL to make the empty-database bootstrap work.

**Why:** Replaying the current history against an empty database fails at migration `0008` because it alters `var_hr_platform_settings`, a pre-existing table absent from the SQL chain; the chain also omits `var_hr_biometric_device_commands`.

**How to apply:** Keep production baselining tied to the inspected live schema. For a clean development database, use the guarded versioned bootstrap schema and test pending SQL migrations from the last matching snapshot.