---
name: Attendance calculation schedule source
description: Historical attendance calculations must use the shift stored on each attendance row, not a later company default.
---

When an attendance row already stores scheduled start, scheduled end, and required hours, use those values as its historical calculation schedule by default. An explicit shift assignment or change to an assigned shift definition may rebase rows when their dates fall within the assignment's effective range, unless a covering payroll period is immutable. A date with no covering payroll period is not protected by a payroll snapshot and can be refreshed.

**Why:** Fnashha records created with an evening shift were displayed with large penalties when reports used the company's 09:00–17:00 default. The user wants movement records to use the employee's assigned shift, while approved, finalized, and locked payroll history remains unchanged. Requiring an open payroll period incorrectly skipped attendance dates with no period.

Treat payroll periods with finalized, approved, or locked status as immutable: do not rebase attendance records in those periods. For editable periods, persist the effective schedule times and required hours on affected rows, recalculate their attendance, and refresh already-calculated payroll snapshots. Draft periods have no saved payroll snapshot yet.

Payroll-generated absence rows are derived records, not punch history. During payroll synchronization, resolve them with the same precedence as attendance entry—employee assignment, department default, company default, then legacy attendance rules—and refresh their stored schedule and calculation when that resolution changes.

**How to apply:** Reports and biometric recalculation use stored attendance schedules unless a schedule assignment or its definition changes. In that explicit path, honor effective dates and skip only dates covered by immutable periods; refresh dates with no period or with an editable period. Keep report calculations aligned with the schedule shown on attendance records.