---
name: Hourly employee pay
description: Per-employee hourly pay derived from reference salary, workdays, and daily hours.
---

Hourly employees use a per-employee rate derived from the entered monthly reference salary, standard monthly workdays, and daily hours. Their payable hours come from biometric check-in/out after approved attendance corrections; approved leave is unpaid, and all payable hours, including time beyond a shift, use the base hourly rate without the company's overtime multiplier. Monthly salary employees keep the existing company-configured overtime rules.

**Why:** The user wants one consistent calculation for hourly employees while retaining the existing shift/overtime system for monthly employees.

**How to apply:** Keep pay basis explicit per employee. Calculate the hourly rate as reference salary divided by (workdays × daily hours); do not treat the reference salary as guaranteed monthly pay unless the user specifies otherwise. Use approved biometric attendance corrections, do not add paid leave hours, and clarify break treatment before implementing payroll behavior.