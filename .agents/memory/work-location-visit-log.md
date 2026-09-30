---
name: Informational work-location records
description: The intended boundary between site-visit history and timekeeping.
---

Work-location changes are informational records of places an employee visited, not attendance movements. They must not change check-in/out, attendance records, approvals, calculations, or payroll. Save GPS coordinates, a comment, the company-local work date, and a server timestamp in an independent location history.

**Why:** The user clarified that this feature is only to confirm whether employees visited their assigned locations; it is not a timekeeping or payroll control.

**How to apply:** Keep future work-location features independent from attendance and payroll APIs, storage, approvals, and metrics. Preserve day-grouped history with each visit's time, map link, and comment.