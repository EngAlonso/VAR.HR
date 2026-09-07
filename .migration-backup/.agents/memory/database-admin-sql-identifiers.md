---
name: Database administration SQL identifiers
description: Raw SQL used by the platform database inspection surface must quote configured identifiers.
---

Configured administration entities can contain PostgreSQL reserved words such as `from` and `to`. Raw SELECT, WHERE, and ORDER BY fragments must quote both table and column identifiers; values remain parameterized or safely serialized.

**Why:** Unquoted payroll period identifiers caused the read/search path to fail before returning data, while the UI reduced the backend error to a generic loading message.

**How to apply:** When adding or changing an administration entity, verify every selected, filtered, sorted, exported, and updated identifier is quoted through the shared identifier helper.