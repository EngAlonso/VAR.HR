---
name: Biometric out-of-order metrics
description: Biometric devices can deliver checkout before check-in, so every derived attendance metric must be refreshed when the earliest movement changes.
---

When biometric movements arrive out of chronological order, the attendance row must recalculate every derived field after replacing the check-in with the earlier movement; otherwise late minutes remain based on the later checkout and inflate deductions.

**Why:** The active Fnashha company exposed this failure: three rows kept late-minute values calculated from a later movement even after their earlier check-ins were stored.

**How to apply:** Any provider-event update that changes check-in or check-out must persist late minutes alongside worked hours, overtime, early checkout, missing minutes, and status.