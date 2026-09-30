---
name: Payroll-generated attendance source
description: API contract compatibility for attendance rows materialized by payroll synchronization.
---

Payroll synchronization creates absence rows whose attendance source is `payroll_sync`. Attendance record response schemas must accept that internal source, but employee punch-input schemas should remain limited to valid punch sources.

**Why:** Strict response validation rejected payroll-generated absence rows, causing attendance read endpoints to fail and preventing the employee attendance screen from loading.

**How to apply:** When adding or changing internal attendance source values, update the attendance response contract and regenerate clients without widening the event-input enum.