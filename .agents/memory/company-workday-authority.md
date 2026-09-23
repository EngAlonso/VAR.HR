---
name: Company workday authority
description: The authoritative source for company-wide working days used by compensation displays.
---

Use the company's attendance rules `workingDays` as the source of truth for company-wide day/hour rate displays. Do not infer the company's off-days from an employee's shift unless the feature explicitly asks for employee-specific scheduling.

**Why:** The company may operate six days per week with Friday as the only weekly day off, while an employee shift can have a different schedule. Using the employee shift can produce an incorrect daily rate.

**How to apply:** For profile compensation summaries, count the current period's calendar dates matching attendance-rule `workingDays`. Keep payroll-period calculations tied to their effective historical attendance rules and holiday handling.