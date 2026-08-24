---
name: OpenAPI codegen hygiene
description: Non-obvious contract validation constraints encountered during API code generation.
---

The API contract must be syntactically valid and all `$ref` targets must exist before Orval can regenerate the server schemas and React client.

**Why:** Regeneration validates the entire existing contract, so an unrelated malformed mapping or stale reference can block otherwise valid endpoint changes.

**How to apply:** When codegen fails on a new contract change, inspect the reported YAML line/reference first and make the smallest compatible correction before diagnosing generated code.