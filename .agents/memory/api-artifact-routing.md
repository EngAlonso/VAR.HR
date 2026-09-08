---
name: API artifact routing
description: The workspace routing relationship between the Replit API artifact and Vercel entrypoints.
---

The runnable Express server must remain the `artifacts/api-server` API artifact. The root `api/` directory is reserved for Vercel serverless entrypoints that import that server; registering the full server from root `api/` can cause the preview proxy to serve the SPA HTML for `/api/*`.

**Why:** During migration, the API process could answer directly while the shared preview returned `index.html` for API paths, hiding the initial Founder setup state.

**How to apply:** When restoring or moving the backend, preserve the API artifact path and workflow registration, keep the Vercel wrappers thin, and verify `/api/healthz` and the Founder status endpoint through the shared preview URL. For Vercel, build the API bundle before the frontend and avoid using the frontend artifact directory as the deployment output directory, because that can omit root `/api` functions.