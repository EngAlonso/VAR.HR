---
name: Database driver compatibility
description: Environment-specific PostgreSQL client behavior for Neon and Replit-hosted databases.
---

Use the Neon HTTP Drizzle client only when `DATABASE_URL` points to a Neon host. Use the node-postgres Drizzle client for Replit-managed PostgreSQL or other non-Neon hosts.

**Why:** Neon HTTP expects Neon’s response format; using it against Replit PostgreSQL caused valid setup-status queries to fail with a `null.map` parser error.

**How to apply:** Keep the connection selection based on the database host, while preserving the same exported `db` and `pool` interfaces for API routes and backup operations.