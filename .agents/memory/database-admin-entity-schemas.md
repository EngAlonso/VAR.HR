---
name: Database administration entity schemas
description: Schema alignment rule for the Platform Owner database inspection routes.
---

Database Administration entity definitions must mirror the live PostgreSQL table columns and explicitly set an available ordering column when a table does not use `created_at`.

**Why:** Leave and Permission request tables use `submitted_at` and do not have `created_at` or `updated_at`; assuming conventional timestamp names caused the inspection endpoint to fail with a database error that the UI surfaced as a generic loading message.

**How to apply:** Before adding or changing an administration entity, inspect its live columns and use only existing fields in SELECT lists, with `orderColumn` set to a real sortable timestamp.