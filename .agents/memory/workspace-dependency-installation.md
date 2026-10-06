---
name: Workspace dependency installation
description: Restoring existing pnpm workspace dependencies when package installation callbacks cannot do so.
---

For restoring dependencies already declared in the workspace, use `pnpm install --frozen-lockfile` if the package callback cannot perform the restore.

**Why:** The package callback rejects an empty package list and attempts `pnpm add` at the workspace root for nonempty lists, which pnpm rejects without explicit workspace-root permission. Adding an unrelated package is not necessary to restore the workspace.

**How to apply:** Read the package-management guidance first. Restore existing dependencies without adding packages. If the registry blocks a locked version, check the latest version of its direct parent first; use a compatible patched dependency override only when the parent has no newer safe release, then refresh the lockfile normally.
