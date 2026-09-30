---
name: Annual-leave eligibility migration
description: Preserve existing automatic annual leave behavior while opting new employees out by default.
---

When introducing an employee-level opt-out for automatic annual leave, preserve existing employees as eligible during schema migration. New employee creation and import paths must explicitly opt out, and older backup records should restore as eligible.

**Why:** Existing employees had no opt-out field and were already receiving the company-wide automatic entitlement. A plain false default would silently disable that behavior for them.

**How to apply:** Check every employee creation/import path and backup normalization whenever this eligibility field or its database defaults change.