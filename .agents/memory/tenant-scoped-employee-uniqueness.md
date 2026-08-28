---
name: Tenant-scoped employee uniqueness
description: Constraints and migration considerations for employee identity fields.
---

Employee identity fields that are optional should use composite unique indexes with the tenant/company identifier; PostgreSQL permits multiple NULL values while enforcing uniqueness for supplied values.

**Why:** Employee uniqueness must be isolated between companies, and an index addition will fail if historical tenant data already contains duplicates.

**How to apply:** Before adding or changing these indexes, inspect duplicate groups and obtain explicit approval for any cleanup of existing records. Keep application pre-checks for clear localized errors, but rely on the database constraint for concurrent-request safety.