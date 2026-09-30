---
name: Field employee location capture
description: GPS capture and approval semantics for employees working at changing locations.
---

Employees with location attendance enabled use the mode named “تسجيل الحركة بالموقع (موقع متغير)” / “Attendance movement with location (variable location)”. They must provide a phone GPS point at every check-in and check-out, bypass fixed geofence enforcement even when the company requires it, and keep each punch out of attendance and payroll calculations until a manager/HR approves it. Approved check-out punches update the existing open attendance record and recalculate its metrics. The company-level fixed mode is named “تسجيل الحركة بالموقع (موقع ثابت)” / “Attendance movement with location (fixed location)” and uses zones configured by the company; its check-in and check-out punches are recorded directly without manager approval.

**Why:** Field staff work across multiple locations, and the company needs each event-time position reviewed before it affects attendance or payroll, without rejecting punches outside a fixed office zone.

**How to apply:** Require GPS coordinates and preserve the approval/map flow for both variable-location directions. Apply approved check-outs to the open attendance record using its stored schedule before recalculating. Variable mode overrides company geofence enforcement; fixed mode bypasses manager approval and uses company zones and GPS policy.