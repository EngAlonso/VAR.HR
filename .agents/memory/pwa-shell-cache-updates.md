---
name: PWA shell cache updates
description: Cache invalidation rule for VAR HR's service worker shell assets.
---

The service worker caches JavaScript and style assets with a versioned shell cache. Any user-visible frontend change that must reach existing PWA clients requires a shell cache version bump.

**Why:** The cache-first asset strategy can keep an older bundled interface in an existing browser even after the dev server and source code are updated.

**How to apply:** When shipping a frontend change that affects the PWA shell, increment the shell cache version in the service worker and verify the updated UI in a fresh browser session.