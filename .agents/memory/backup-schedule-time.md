---
name: Backup schedule time
description: Platform backups run four times daily in Cairo time; company daily backups retain their 13:00 run.
---

Run the full platform backup at 01:00, 07:00, 13:00, and 19:00 Africa/Cairo
time. Treat each six-hour slot as independently due; do not use a rolling
six-hour elapsed interval, which drifts away from the requested wall-clock
times. Use the IANA timezone so slots follow Cairo daylight-time changes.

Enabled daily company backups still run at or after 13:00 Africa/Cairo time;
company scheduling is independent from platform scheduling.

**Why:** The user requested four fixed daily platform backup times and did not
change the company backup cadence.

**How to apply:** Keep platform and company schedules independently
configurable. Persistent servers should poll frequently; serverless hosts need
UTC cron checks for both Cairo offsets, with the timezone-aware slot check
preventing duplicates.
