---
name: Settings mutation payloads
description: How current settings forms should send data to generated PUT clients.
---

Current-settings forms should construct a contract-shaped mutation payload: remove server-owned identity and timestamp fields, coerce numeric inputs at the boundary, and preserve generated enum unions instead of widening them to number.

**Why:** API input schemas do not accept database metadata, and generated clients expose enum types that catch accidental widening before a request reaches the server.

**How to apply:** Copy form state before submission, strip fields such as identity, ownership, and timestamps, then coerce and narrow numeric enum fields in the final payload while leaving server-owned fields to the API.