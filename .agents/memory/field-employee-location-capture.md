---
name: Field employee location capture
description: GPS capture and approval semantics for employees working at changing locations.
---

Employees with location attendance enabled use the mode named “تسجيل الحركة بالموقع (موقع متغير)” / “Attendance movement with location (variable location)”. They must provide a phone GPS point at each punch. Their work sites may vary, so the employee-specific setting must not require a fixed company geofence; the first phone check-in remains pending manager/HR approval and carries the captured location for review. The company-level mode is named “تسجيل الحركة (موقع ثابت)” / “Attendance movement (fixed location)” and uses zones configured by the company.

**Why:** Field staff work across multiple locations, and the company needs the event-time position without incorrectly rejecting punches outside a fixed office zone.

**How to apply:** When changing employee location attendance, require GPS coordinates and preserve the approval/map flow. Keep employee variable-location capture distinct from the company-defined fixed-location mode.