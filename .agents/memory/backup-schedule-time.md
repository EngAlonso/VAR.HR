---
name: Backup schedule time
description: Platform owners can choose 1, 2, or 4 daily Cairo-time runs; company daily backups retain their 13:00 run.
---

Platform backup frequency is selected as 1, 2, or 4 runs per day:
- 1 run: 13:00 Africa/Cairo.
- 2 runs: 01:00 and 13:00.
- 4 runs: 01:00, 07:00, 13:00, and 19:00.

Treat each selected wall-clock slot as independently due; do not use a rolling
elapsed interval, which drifts from the selected Cairo times. Use the IANA
timezone so slots follow daylight-time changes. Previously stored positive
interval settings must be treated as the existing four-runs choice; new
frequency values are 1, 2, or 4.

Enabled daily company backups still run at or after 13:00 Africa/Cairo time;
company scheduling is independent from platform scheduling.

**Why:** The user wants to choose platform backup frequency while retaining
the prior four-runs schedule as the current default; company cadence is separate.

**How to apply:** Keep platform and company schedules independently
configurable. Persistent servers should poll frequently; serverless hosts need
UTC cron checks for both Cairo offsets, with the timezone-aware slot check
preventing duplicates.
