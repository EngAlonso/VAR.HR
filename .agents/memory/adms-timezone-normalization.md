---
name: ADMS timestamp normalization
description: The timezone rule for raw ZKTeco ADMS attendance timestamps and legacy data repair.
---

Raw ZKTeco ADMS timestamps without an offset are device wall-clock values, not UTC values. They must be parsed using the company's configured timezone before storing `occurredAt` or deriving an attendance date.

**Why:** Treating the raw wall-clock value as UTC shifts late-night punches into the next local calendar day, creating biometric attendance on the wrong date.

**How to apply:** Keep ingestion and any historical repair aligned with the company timezone. When auditing old ADMS events, compare the stored timestamp with the raw payload timestamp interpreted in that timezone.