---
name: Field employee location capture
description: GPS capture and approval semantics for employees working at changing locations.
---

Employees with location attendance enabled must provide a phone GPS point at each punch. Their work sites may vary, so the employee-specific setting must not require a fixed company geofence; the first phone check-in remains pending manager/HR approval and carries the captured location for review. A company-wide GPS policy set to required is still a separate, strict geofence rule.

**Why:** Field staff work across multiple locations, and the company needs the event-time position without incorrectly rejecting punches outside a fixed office zone.

**How to apply:** When changing employee location attendance, require GPS coordinates and preserve the approval/map flow. Only enforce a fixed geofence when the company-wide GPS policy explicitly requires it.