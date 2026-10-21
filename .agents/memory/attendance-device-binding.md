---
name: Attendance device binding
description: Product boundary for employee attendance devices and admin reassignment.
---

Employee web attendance is linked to a random token stored in that browser's local storage. The server stores only its SHA-256 hash. New browser tokens remain pending until an administrator approves them; approving one replaces the employee's previous active token.

**Why:** Browser apps cannot reliably read a permanent hardware identifier. This flow avoids collecting employee photos while blocking attendance from a different browser unless an administrator approves it. It does not prove who is holding the approved phone, and the token can be copied or lost when browser storage is cleared.

**How to apply:** Describe this as browser/device registration, not immutable hardware locking or identity verification. If stronger device identity is required, evaluate a native app with platform device attestation. Keep admin approval and reassignment available.
