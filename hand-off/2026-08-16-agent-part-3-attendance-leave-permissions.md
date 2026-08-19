# VAR HR — Part 3 Attendance, Leave & Permissions

## Date

2026-08-16

## Final status

**Complete**

Part 3 was completed from the existing implementation. The work stayed within
Attendance, Leave, and Permission operations. Part 4 and the later roadmap
modules were not started.

## Starting state

The repository already contained the Part 1 and Part 2 hand-off records and an
initial Part 3 implementation through:

```text
OpenAPI → generated client → Express API → React UI
```

The existing code already included:

- Tenant-aware attendance, leave, and permission queries.
- Attendance history, date/employee filters, check-in, check-out, and
  correction UI/API paths.
- Leave balances, configurable leave types from balance data, request creation,
  and approval/rejection paths.
- Permission request creation and approval/rejection paths.
- Role/capability-driven navigation and the existing four-locale UI.

The imported development database did not contain the existing `var_hr_*`
tables, so the API could not start until the existing Drizzle schema was
applied.

## What was already completed by the previous agent

- Provider-neutral tenant context and server-side company/employee scope.
- Production fail-closed authentication boundary.
- Existing generated OpenAPI/Zod/client contracts for Part 3 operations.
- Existing Attendance, Requests, localization, RTL, and responsive UI
  surfaces.
- Managed artifact registration and the original API, web, and Canvas
  workflows.

No authentication provider, production identity mapping, fake user, or fake
credential was introduced.

## What was continued

### Attendance

- Fixed the attendance history and attendance report query boundary so valid
  ISO calendar date strings are validated as date strings instead of being
  converted to JavaScript `Date` objects first.
- Added rejection of reversed `from`/`to` ranges.
- Verified date filtering and employee filtering through the live API.
- Completed correction consistency: corrected check-in/check-out timestamps now
  recalculate worked hours, overtime hours, and late minutes.
- Preserved correction validation for invalid timestamps, check-in after
  check-out, required reason, and scoped record access.
- Preserved the existing attendance source, explanation, audit, status, and
  tenant boundaries.

### Leave

- Verified leave balances are scoped by employee authorization and company.
- Verified multiple leave types are data-driven from existing balance records;
  no hard-coded configurable leave list replaced the existing data.
- Verified date validation, balance validation, overlap validation, pending
  balance updates, approval balance updates, and decision history fields.
- Added server-side rejection-reason validation for rejected leave decisions.
- Verified employee creation and visibility, manager in-scope review and
  approval, company-owner capability exposure, and self-approval prevention.

### Permission requests

- Verified employee creation and status visibility.
- Verified manager review is limited to the manager's authorized employee
  scope.
- Added server-side rejection-reason validation for rejected permission
  decisions.
- Verified manager rejection with a decision reason and prevention of
  self-approval.
- Preserved company and employee-scope enforcement for approval endpoints.

## Authorization and security changes

The existing authorization architecture was preserved and strengthened only
where Part 3 validation exposed a gap:

- Company and platform owners retain company-level attendance correction and
  approval capabilities.
- Managers remain limited to their department scope.
- Employees remain limited to their own employee records and cannot correct or
  decide requests.
- Approval/rejection endpoints enforce capability, company scope, manager
  scope, pending status, and self-request prevention server-side.
- Cross-company tenant access remains rejected.
- Production requests still fail closed with `401 WORKSPACE_AUTH_REQUIRED`
  without a verified provider principal.

## API and contract changes

Changed:

- `artifacts/api-server/src/routes/var-hr.ts`
  - ISO date query validation and range validation.
  - Attendance correction derived totals.
  - Server-side rejection-reason validation.

The OpenAPI response and request shapes did not change, so no code generation
was necessary. Generated Zod schemas and React Query hooks remain in sync with
the contract.

## Database changes

- No schema change was required.
- The existing Drizzle schema was applied to the imported development database
  with:

```text
pnpm --filter @workspace/db run push
```

- This was non-destructive. No drop, truncate, reset, recreation, or data
  erasure was performed.
- Controlled development validation created one test leave request and one
  test permission request, then approved/rejected them through the normal
  workflow. This data remains in the development workspace as operational
  validation evidence.

## UI and localization

- No unrelated UI redesign was made.
- The existing VAR HR Requests and Attendance screens were preserved.
- Existing English, Arabic, French, and German localization and RTL/LTR
  behavior were preserved.
- The live desktop Attendance preview rendered the existing design with
  present, late, on-leave, and missing check-in/check-out states.
- No new visible text or second translation system was introduced.
- Interactive Arabic browser capture was not available in the static preview
  tool; the existing hand-off's API locale/RTL validation remains applicable.

## Validation performed

### Typecheck and builds

- `pnpm run typecheck:libs` — PASS
- `pnpm --filter @workspace/api-server run typecheck` — PASS
- `pnpm --filter @workspace/var-hr run typecheck` — PASS
- `pnpm --filter @workspace/api-server run build` — PASS
- `PORT=22077 BASE_PATH=/ pnpm --filter @workspace/var-hr run build` — PASS

### Runtime

- Development database schema push — PASS
- API workflow `artifacts/api-server: API Server` — RUNNING on port 8080
- Web workflow `artifacts/var-hr: web` — RUNNING on port 22077
- Canvas workflow remained running and unchanged
- `GET /api/healthz` — HTTP 200, `{"status":"ok"}`
- VAR HR Attendance preview — rendered successfully

### API and workflow checks

- Attendance date filter — PASS
- Reversed attendance range rejection — PASS
- Attendance report date filter — PASS
- Employee-only attendance scope — PASS
- Manager department attendance scope — PASS
- Employee unauthorized correction — HTTP 403, PASS
- Authorized attendance correction — HTTP 200, PASS
- Invalid correction timestamps — HTTP 400, PASS
- Employee creates and sees leave request — PASS
- Manager sees in-scope leave request — PASS
- Manager approves leave request — PASS
- Employee creates permission request — PASS
- Manager sees in-scope permission request — PASS
- Manager rejects permission request with reason — PASS
- Rejection without a reason — HTTP 400, PASS
- Manager self-approval — HTTP 403, PASS
- Cross-company tenant access — HTTP 403, PASS
- Production workspace without verified principal — HTTP 401
  `WORKSPACE_AUTH_REQUIRED`, PASS

## Runtime and Preview results

The original managed workflows are available and running. The API initializes
successfully after the non-destructive development schema push. The Attendance
screen rendered through the proxied preview and the API returned live seeded
data. No duplicate replacement workflow was created.

The pre-existing React hook-order warning in the Overview screen remains in
browser logs. It is unrelated to the Part 3 changes and was not modified.

## Remaining issues

1. Production authentication is still intentionally provider-neutral and
   fail-closed. A provider decision and server-side identity-to-company/role
   mapping are required before production login can be implemented.
2. The pre-existing Overview React hook-order warning remains.
3. Attendance absence/late/overtime policy expansion remains bounded by the
   future attendance-rules work; no new rules engine was introduced here.

## Dependencies for future phases

- Production authentication provider selection and membership mapping from
  Part 2.
- Future biometric device synchronization, GPS enforcement, attendance rules
  expansion, overtime engine, payroll rules, and advanced reporting remain
  outside Part 3.

## Exact recommended next phase

Complete the explicit Part 2 production authentication decision and attach the
verified provider principal to the existing tenant-context boundary. After
that, add provider-backed authorization tests before starting the next
operational roadmap phase.