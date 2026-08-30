---
name: Operational attendance rule date
description: The calendar boundary used when attendance settings are saved and read.
---

Automatic attendance-rule changes use the server's operational calendar date in the company's Cairo operating context, so the saved change starts at the first day of the current calendar month rather than a frozen fixture date.

**Why:** A hard-coded date makes current settings stale and can place a newly saved change in the wrong month. Historical attendance, permission, and payroll calculations must still resolve rules from their event or period date.

**How to apply:** Use the runtime operational date only for current settings and the automatic change-month boundary. Pass the relevant attendance, permission, or payroll date into historical rule and annual-balance lookups.