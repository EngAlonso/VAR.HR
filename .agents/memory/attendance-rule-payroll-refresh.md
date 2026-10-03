---
name: Attendance-rule payroll refresh
description: Product behavior for applying updated attendance rules to payroll periods.
---

Attendance-rule changes take effect from the current month. Recalculate existing calculated payroll periods that overlap that effective month and have not been approved, finalized, or locked. Preserve periods before the effective month.

Leave draft periods as drafts; their first calculation will use the effective rules. Do not create a payroll snapshot merely because a rule changed.

**Why:** The user wants updated attendance rules reflected in payroll until a period is actually approved. Drafts have no saved calculation to refresh, and calculating them during a rule save could create premature absence deductions.

**How to apply:** After saving a payroll-relevant attendance rule, refresh current-month attendance calculations and recalculate overlapping open payroll snapshots. Keep approved, finalized, and locked periods unchanged, and invalidate payroll list, detail, and employee-summary queries.