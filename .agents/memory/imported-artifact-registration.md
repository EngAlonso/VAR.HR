---
name: Imported artifact registration
description: Runtime behavior observed when a project is imported with artifact metadata already present.
---

Imported projects may contain valid `.replit-artifact/artifact.toml` files while the runtime still reports no registered artifacts or managed workflows. In that state, `WorkflowsRestart` cannot find the artifact service, and creating a replacement workflow risks bypassing the artifact routing and environment contract.

**Why:** The artifact metadata is filesystem state, while runtime registration is separate; treating the file as proof that the workflow exists leads to restart failures or conflicting workflows.

**How to apply:** Check `listArtifacts()` and `listWorkflows()` before restarting an imported service. If both are empty, preserve the artifact metadata and report the registration blocker rather than manually configuring a duplicate service.

Imported VAR HR workspaces can also arrive with a reachable but uninitialized development database; the API will build successfully and fail during seed startup until the existing Drizzle schema is pushed.

**Why:** Importing source and artifact metadata does not guarantee that the development database has been initialized.

**How to apply:** If startup reports a missing existing application table, run the documented development schema push once, then retry startup; do not drop or recreate the database.