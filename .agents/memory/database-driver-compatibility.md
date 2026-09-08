---
name: Database driver compatibility
description: Environment-specific PostgreSQL client behavior for Neon and Replit-hosted databases.
---

Use the node-postgres Drizzle client when the application needs transactions, advisory locks, or multi-step atomic operations, including when `DATABASE_URL` points to Neon. Neon HTTP is only suitable for query-only paths.

**Why:** Neon HTTP expects Neon’s response format, but Drizzle's Neon HTTP session does not support transactions. The VAR HR provisioning and HR workflows use transactions and PostgreSQL advisory locks.

**How to apply:** Keep the exported `db` and `pool` interfaces stable, and prefer `drizzle-orm/node-postgres` for this app's Neon and Replit deployments.