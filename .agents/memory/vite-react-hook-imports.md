---
name: Vite React hook imports
description: Frontend-specific React hook resolution behavior observed with Vite dependency prebundling.
---

When a hook is legally called from a rendered component but Vite reports an invalid hook call with a null React dispatcher, align the hook module with the app’s direct named React imports before changing component structure or auth logic.

**Why:** In this workspace, React and React DOM were pinned to the same version and resolved to one physical installation, while the failing hook used a namespace React import across the Vite prebundle boundary. Switching the hook to direct named imports removed the runtime failure without changing behavior.

**How to apply:** First verify the call is unconditional and the dependency graph has one React copy. If those checks pass, use direct named imports for hook functions, restart the managed Vite workflow, and inspect browser console logs before considering broader dependency changes.