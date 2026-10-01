---
name: Attendance calculation schedule source
description: Historical attendance calculations must use the shift stored on each attendance row, not a later company default.
---

When an attendance row already stores scheduled start, scheduled end, and required hours, use those values as the historical calculation schedule. Do not recalculate it from the employee, department, or company default schedule unless the attendance row has no stored schedule.

**Why:** Fnashha records created with an evening shift were being displayed with large penalties because the report recalculated them against the company's 09:00–17:00 default shift.

Payroll-generated absence rows are derived records, not punch history. During payroll synchronization, resolve them with the same precedence as attendance entry—employee assignment, department default, company default, then legacy attendance rules—and refresh their stored schedule and calculation when that resolution changes. Do not rebase rows with actual punches.

**How to apply:** Keep report calculations and biometric recalculation aligned with the schedule shown on attendance records. Reconcile only payroll-generated absence rows during payroll synchronization, then persist the recalculation.