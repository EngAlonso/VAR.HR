---
name: Payroll cycle proration
description: Rules for calculating partial payroll previews for employees assigned to a payroll cycle.
---

Partial payroll previews must use the employee's full assigned payroll-cycle range as the denominator, not the selected date range. Attendance synchronization, absence detection, and employee-summary attendance inputs must be limited to the requested from/to dates so dates outside the selection do not affect the preview.

**Why:** A cycle starting on day 1 can contain 26 scheduled workdays in a six-day workweek, while a preview through day 21 contains only 18 elapsed scheduled days. Treating the preview window as the full period either overstates the salary or deducts future days.

**How to apply:** Resolve the employee's cycle range first; pass the selected from date and requested through date as the calculation window while retaining the cycle range for rate denominators. For no-persist previews, calculate missing biometric attendance details transiently so worked time, lateness, overtime, and penalties are included without mutating attendance records.