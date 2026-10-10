---
name: Backup schedule time
description: Daily company and platform backups run at 13:00 in Cairo local time.
---

Run both the full platform backup and each enabled company backup daily at or
after 13:00 Africa/Cairo time. A backup before 13:00 on the same local date
does not satisfy that day's scheduled run. Recalculate the local date and time
with the IANA timezone rather than assuming a fixed UTC offset or 24-hour
elapsed interval.

**Why:** The user requested a consistent 13:00 Cairo-time backup for companies
and the platform owner.

**How to apply:** Keep the platform and company schedules independently
configurable, and use Cairo wall-clock time when determining the daily run.
