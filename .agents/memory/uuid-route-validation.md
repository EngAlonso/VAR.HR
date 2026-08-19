---
name: UUID route validation
description: API path schemas expose identifiers as strings, so route handlers must validate UUIDs before Drizzle queries.
---

Validate UUID path and foreign-key identifiers at the route boundary before
passing them to PostgreSQL. Generated OpenAPI parameter schemas may only
enforce `string`, and an invalid identifier can otherwise become a database
cast error and a 500 response instead of a client error.

**Why:** A malformed device identifier exposed this behavior during Task 1
verification; the database rejected the cast before the not-found branch ran.

**How to apply:** Add route-local UUID validation for new handlers, including
path IDs and optional UUID foreign keys from request bodies, before any query.