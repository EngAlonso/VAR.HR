---
name: Informational work-location records
description: The intended boundary between site-visit history and timekeeping.
---

Work-location changes are informational records of places an employee visited, not attendance movements. The employee action captures GPS directly; do not require them to type the location. Save coordinates, accuracy, the company-local work date, and server timestamp in an independent location history, with an automatically generated GPS note rather than a manually entered location description.

**Why:** The user wants work locations captured by GPS rather than written manually. The feature only confirms whether employees visited assigned locations; it is not a timekeeping or payroll control.

**How to apply:** Keep future work-location features independent from attendance and payroll APIs, storage, approvals, and metrics. Capture GPS on an explicit user action and preserve day-grouped history with each visit's time, map link, and automatic GPS note.