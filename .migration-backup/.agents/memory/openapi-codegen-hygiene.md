---
name: OpenAPI codegen hygiene
description: Non-obvious contract validation constraints encountered during API code generation.
---

The OpenAPI file is the source of truth; after contract changes, regenerate both server validation and React client types before relying on a new request field. Otherwise Zod can strip the field at runtime even when the route and UI use it.

**Why:** Regeneration validates the entire existing contract, so an unrelated malformed mapping or stale reference can block otherwise valid endpoint changes; stale generated schemas can also silently discard otherwise valid form data.

**How to apply:** Run the API-spec codegen after changing the contract or adding fields, then typecheck the workspace and inspect generated schemas when a form submits data that previously was not in the contract.