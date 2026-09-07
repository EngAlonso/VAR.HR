# VAR HR — Runtime Validation Work Log

## Date

2026-08-16

## Scope

Continue from the completed Arabic localization and build validation. Resolve
the imported development-database runtime blocker and validate the live API
and frontend without changing unrelated product code.

## Database recovery

- Confirmed the configured development PostgreSQL database was reachable.
- Confirmed the public schema had no existing `var_hr_*` tables.
- Applied the existing Drizzle schema with:
  `pnpm --filter @workspace/db run push`
- Confirmed the 15 existing `var_hr_*` tables were present afterward.
- No destructive database operation was performed. No tables or data were
  dropped, truncated, reset, or recreated.

## Runtime recovery

- The imported workspace had artifact metadata on disk but no registered
  artifacts/workflows at the start of this pass.
- Refreshed each existing artifact TOML through the supported verifier without
  changing its contents.
- Restarted the existing managed workflows one at a time:
  - `artifacts/api-server: API Server`
  - `artifacts/var-hr: web`
- Canvas was already registered/running but was not part of this validation.

## Verified runtime behavior

- API health: `GET /api/healthz` returned HTTP 200 and `{"status":"ok"}`.
- Frontend: VAR HR `/` returned HTTP 200 and the dashboard rendered in the
  live preview.
- Arabic workspace response: `GET /api/workspace` with
  `x-var-locale: ar` returned HTTP 200, `locale: "ar"`, and
  `direction: "rtl"`.
- Arabic dashboard response: `GET /api/dashboard/summary` with
  `x-var-locale: ar` returned HTTP 200 and Arabic alert title/detail text.
- Final managed workflow status: API and VAR HR web both reported `running`
  with ports 8080 and 22077.

The static preview browser retained English as its selected locale, so the
captured screenshot is an English dashboard runtime screenshot. The Arabic
locale/RTL behavior was verified at the live API/UI locale boundary; no
interactive locale-switch action was available in the static preview tool.

## Files

- `hand-off/2026-08-16-runtime-validation-preview.jpg` — captured live
  dashboard preview.
- `hand-off/MASTER-HANDOFF.md` — updated with the final verified state.

## Out of scope

The existing `Overview` React hook-order warning was observed in browser
console output and intentionally left unchanged because it is unrelated to the
database/runtime blocker.