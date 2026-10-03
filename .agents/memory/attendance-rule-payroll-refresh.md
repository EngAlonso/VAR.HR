---
name: Attendance-rule payroll refresh
description: Product behavior for applying updated attendance rules to payroll periods.
---

After an attendance-rule change, apply the latest rules retroactively to every editable payroll period up to today. Recalculate existing calculated periods automatically; draft periods remain drafts and use the latest rules when first calculated. Approved, finalized, and locked periods stay unchanged.

Historical attendance and payroll calculations in editable periods must use the current rule configuration, not the older date-effective configuration. Keep date-effective historical rules for attendance views and immutable payroll snapshots.

**Why:** The user wants updated attendance rules reflected in old payroll months until the payroll period is approved.

**How to apply:** After saving a payroll-relevant rule, recalculate all calculated editable periods whose start is no later than today. Do not create snapshots for drafts on rule save; ensure their first calculation uses current rules. Never mutate approved, finalized, or locked payroll snapshots.