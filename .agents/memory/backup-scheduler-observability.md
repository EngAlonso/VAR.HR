---
name: Backup scheduler observability
description: Persistence rules for visible platform and company backup scheduler status.
---

Record every authenticated scheduled invocation, including no-op runs where no backup is due. Keep each invocation summary separate from the latest actual attempt for the platform or a company, so a later no-op does not erase the target's last backup result. Do not persist routine idle checks from the one-minute server poller.

**Why:** A scheduled request can return successfully without creating a backup, while recording every server poll would create noisy, misleading status.

**How to apply:** Preserve this distinction when changing scheduler triggers, backup execution, or the platform-owner status screen. Store status in the database used by that runtime and the UI reading it.
