# VAR HR — Part 5 Payroll Handoff
# Date: 2026-08-17

## Status

Part 5 payroll foundation work is complete for the requested provider-neutral,
country-neutral scope. Parts 1–4 were preserved. Part 6 was not started.

## Delivered

### API contract and backend

- Regenerated the OpenAPI-derived Zod schemas and React client outputs from
  `lib/api-spec/openapi.yaml`.
- Confirmed `finalized` is present in the generated payroll period status
  contract.
- Updated the server payroll response typing to include `finalized`.
- Payroll period creation validates date ranges and rejects overlapping
  periods.
- Payroll calculation writes the actual computed net total in the period update,
  rather than using a salary-sum or zero placeholder.
- Existing calculation snapshots, versioning, localized explanations, and
  tenant/role authorization remain in place.
- Finalized and locked periods remain immutable for adjustments and cannot be
  recalculated into new snapshots.

### Payroll UI

`artifacts/var-hr/src/App.tsx` now supports:

- Creating a payroll period.
- Selecting and viewing a period.
- Calculating and reloading stored calculations.
- Viewing totals and the employee-level payroll table.
- Inspecting employee attendance inputs and calculation line items.
- Adding and viewing fixed/variable additions or deductions.
- Removing adjustments before finalization.
- Finalizing a calculated period.
- Hiding mutation controls after finalization.

New user-facing payroll strings were added to the existing English, Arabic,
French, and German dictionaries. The existing locale and RTL/LTR architecture
was not replaced.

## Validation

### Contract/build validation

- `pnpm --filter @workspace/api-spec run codegen` — PASS.
- `pnpm --filter @workspace/api-server run typecheck` — PASS.
- `pnpm --filter @workspace/var-hr run typecheck` — PASS.
- Root workspace typecheck stage — PASS.
- `pnpm --filter @workspace/api-server run build` — PASS.
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/var-hr run build` — PASS.
- `PORT=8080 BASE_PATH=/__mockup pnpm --filter @workspace/mockup-sandbox run build` — PASS.
- A root `pnpm run build` invocation reached all typechecks but its manual
  recursive build was blocked by the Vite configs' required managed
  `PORT`/`BASE_PATH` environment variables; the same artifact builds passed
  with those variables supplied.

### Live API validation

The managed API workflow is running on port 8080 after applying the existing
development Drizzle schema non-destructively with:

```text
pnpm --filter @workspace/db run push
```

Validated against the seeded Northstar workspace:

- Create period → calculate → add adjustment → list adjustment → delete
  adjustment → add another adjustment → recalculate → finalize — PASS.
- Finalized adjustment creation returns HTTP 409 with a localized immutable
  payroll error — PASS.
- Manager payroll-period access returns HTTP 403 — PASS.
- Employee calculation access returns one employee-scoped item when a valid
  employee identity is supplied — PASS.
- Invalid payroll period dates return HTTP 400 in Arabic — PASS.
- Payroll calculation explanations are localized in Arabic and French — PASS.
- Tenant scope remains bound to the existing development workspace adapter;
  production fail-closed authentication was not changed.

## Runtime evidence

- Managed workflows running:
  - `artifacts/var-hr: web`
  - `artifacts/api-server: API Server`
  - `artifacts/mockup-sandbox: Component Preview Server`
- Payroll preview screenshot:
  `hand-off/2026-08-17-part-5-payroll-desktop.jpg`
- The preview rendered the payroll list with create-period, calculated, and
  finalized states without browser console errors beyond the normal React
  DevTools informational message.

## Intentional boundaries

- No country-specific tax, insurance, statutory, or legal payroll rules were
  invented.
- No new authentication provider was introduced.
- No duplicate payroll routes, competing generated types, or second i18n
  system were introduced.
- The validation period created in the development database is retained as
  runtime evidence; it is finalized and cannot be edited.

## Recommended next work

The next useful improvement is automated regression coverage for the payroll
lifecycle and role matrix, especially finalized-period immutability and
employee-scoped calculation responses. This is outside the completed Part 5
implementation scope.