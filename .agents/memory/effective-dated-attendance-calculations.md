---
name: Effective-dated attendance calculations
description: Historical attendance and payroll must retain the rule decisions that were applied when they were calculated.
---

Attendance and payroll history must be immutable with respect to future rule edits; effective-dated rule versions determine new calculations, while stored calculations retain their applied multiplier and source.

**Why:** Payroll disputes require historical results to remain reproducible even after managers change schedules, leave settings, holidays, or overtime policies.

**How to apply:** Persist applied rule metadata with each calculation and make payroll consume stored calculations rather than re-evaluating old attendance against today’s rules. Current and future attendance records may be re-evaluated after a policy save; past records must remain unchanged.