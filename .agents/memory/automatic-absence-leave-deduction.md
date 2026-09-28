---
name: Automatic absence leave deduction
description: The product rule for converting qualifying absence states into annual leave balance deductions.
---

The annual-leave deduction checkbox in attendance rules is the master switch for automatic deductions caused by absence. When it is off, absence states must not create new deductions; when it is on, the configured trigger determines whether missing attendance also qualifies.

**Why:** The user explicitly requires that annual leave is deducted automatically only when the setting is enabled, rather than treating absence as an implicit annual-leave deduction.

**How to apply:** Keep the setting separate from manual absence conversion and ordinary approved-leave deductions. Every automatic deduction must still pass the configured absence-day amount, allowed months, monthly limit, available balance, and idempotent ledger checks.