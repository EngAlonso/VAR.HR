---
name: Actual vs payable overtime
description: The attendance movement record and payroll intentionally use different overtime values.
---

Attendance movement history must show actual extra worked minutes after the scheduled end time, even when automatic overtime is disabled. The configured overtime value is a minimum qualification threshold: if raw extra time reaches it, all raw extra minutes count. Payroll must use only the final eligible overtime minutes, plus explicitly approved manual overtime.

**Why:** Users need to audit time physically worked separately from the company decision to pay automatic overtime. Historical calculation snapshots may have been created while automatic overtime was disabled, so movement and payroll reads must recalculate from the stored attendance schedule when needed.

**How to apply:** Measure automatic overtime from checkout versus the scheduled end clock time, not from total worked duration. Keep actual overtime in the calculation's original overtime value; gate automatic overtime when producing final overtime and payable hours. Do not use the movement display value as the payroll base.