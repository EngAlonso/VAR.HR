---
name: Managed Vite build variables
description: Environment-specific behavior of the imported artifact Vite production builds.
---

The VAR HR and component-preview Vite production configurations intentionally
require both `PORT` and `BASE_PATH`. Managed workflows provide these values,
but a raw root `pnpm run build` invocation may fail during the artifact build
phase if they are absent.

**Why:** This is a workflow/build-environment boundary rather than an
application failure; targeted builds pass when the same values are supplied.

**How to apply:** For manual artifact build verification, provide the managed
workflow values explicitly (for example `PORT=5173 BASE_PATH=/` for the web
artifact) and rely on the registered workflows for runtime verification.