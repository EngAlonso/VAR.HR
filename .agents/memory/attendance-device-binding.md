---
name: Attendance device binding
description: Product boundary for employee attendance devices and admin reassignment.
---

Browser approval for employee attendance is a company-owner setting and is disabled by default. When enabled, browser tokens must be approved by an administrator before an employee or manager can punch; approving a new token replaces the previous active token. When disabled, punches do not require a browser token. Each web/mobile check-in and check-out records a coarse device type derived from the User-Agent, including location-pending punches after approval.

**Why:** The company asked for approval to be optional rather than the default, while retaining phone-type visibility on each punch. Browsers cannot reliably read an immutable phone model or hardware identifier; User-Agent classification is only a best-effort category such as Android, iPhone/iOS, tablet, or desktop.

**How to apply:** Describe the setting as optional browser approval and the logged value as a broad device type, not the exact phone model or identity proof. When explaining the toggle, direct company owners to Attendance Rules. Keep approval and reassignment available when the setting is enabled.
