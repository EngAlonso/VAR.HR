---
name: Actual vs payable overtime
description: The attendance movement record and payroll intentionally use different overtime values.
---

Attendance movement history must show actual extra worked minutes after the scheduled normal time and configured overtime threshold, even when automatic overtime is disabled. Payroll must use only the final eligible overtime minutes, plus explicitly approved manual overtime.

**Why:** Users need to audit time physically worked separately from the company decision to pay automatic overtime. Historical calculation snapshots may have been created while automatic overtime was disabled, so movement and payroll reads must recalculate from the stored attendance schedule when needed.

**How to apply:** Keep actual overtime in the calculation's original overtime value; gate automatic overtime when producing final overtime and payable hours. Do not use the movement display value as the payroll base.