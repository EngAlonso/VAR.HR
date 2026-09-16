---
name: Attendance calculation schedule source
description: Historical attendance calculations must use the shift stored on each attendance row, not a later company default.
---

When an attendance row already stores scheduled start, scheduled end, and required hours, use those values as the historical calculation schedule. Do not recalculate it from the employee, department, or company default schedule unless the attendance row has no stored schedule.

**Why:** Fnashha records created with an evening shift were being displayed with large penalties because the report recalculated them against the company's 09:00–17:00 default shift.

**How to apply:** Keep report calculations and biometric recalculation aligned with the schedule shown on the attendance record, and persist the calculation after provider events.