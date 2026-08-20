---
name: Managed workflow port handoff
description: Handling port conflicts after replacing legacy workflows with registered artifact services.
---

When replacing a legacy workflow with an artifact-managed service, do not assume removing the old workflow immediately releases its port. If the managed restart reports the port is in use, inspect the listener and process command first, then terminate only the confirmed orphaned process.

**Why:** Workflow metadata can be removed before a previously launched child process has exited, leaving the artifact service unable to start despite no visible duplicate workflow.

**How to apply:** Prefer the registered artifact workflow. Remove only the duplicate legacy workflow, identify any remaining listener by port and command, stop the matching orphan, and restart the artifact-managed service.