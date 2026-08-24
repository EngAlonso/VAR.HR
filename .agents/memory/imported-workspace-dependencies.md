---
name: Imported workspace dependencies
description: Dependency state to expect when continuing an imported monorepo.
---

Imported monorepos can have a complete lockfile and source tree while lacking installed workspace dependencies, causing code generators to fail with missing binaries.

**Why:** Source import and package installation are separate operations.

**How to apply:** Before diagnosing generator or build errors, install from the existing lockfile without changing dependency versions; then rerun the project command.