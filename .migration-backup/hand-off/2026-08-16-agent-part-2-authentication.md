# VAR HR — Part 2 Authentication Foundation Work Log

## Date

2026-08-16

## Status

**Partially complete / blocked on an explicit production authentication decision.**

The repository does not specify a production authentication provider or a
server-side identity-to-company membership mapping. No provider was invented,
and no fake production login was added.

## What was present when this pass started

- The Part 1 implementation and hand-off history were present.
- `artifacts/api-server/src/lib/tenant-context.ts` already defined the
  replaceable workspace boundary.
- In development, `x-var-tenant`, `x-var-role`, and `x-var-employee` were
  available only as a seeded review adapter.
- In production, the boundary already failed closed with
  `WORKSPACE_AUTH_REQUIRED` before accepting those headers.
- Company-scoped queries, employee scopes, role capabilities, and protected
  mutations already resolved authorization from `TenantContext`.
- `lib/db/src/schema/organization.ts` contains companies and employees, but the
  current checked-in schema does not contain an authenticated-user or company
  membership mapping keyed to an external provider subject.
- The frontend shell used a hard-coded fallback company-owner workspace and a
  hard-coded `AO` avatar while the workspace query was loading or failed.
- The managed development database was missing the existing `var_hr_*` tables
  after import.

## Changes made

### Authentication-aware frontend boundary

Updated `artifacts/var-hr/src/App.tsx` to:

- Remove the hard-coded `fallbackWorkspace`.
- Render a localized loading state while `/api/workspace` is initializing.
- Render a localized unauthorized state for workspace `401`/`403` responses.
- Render a localized initialization error state for other workspace failures.
- Retry only the workspace query from the boundary state.
- Enable the dashboard summary query only after a server workspace response
  exists.
- Remove the hard-coded `AO` user identity marker.
- Display the server-provided role label instead of inventing a user identity.
- Preserve the existing role/capability-driven navigation after authentication
  context is available.
- Add English, Arabic, French, and German copy for the new states.

This prevents the UI from showing another user's or a demo user's workspace
while authentication/workspace initialization is loading or unavailable.

### Development database recovery

Applied the existing Drizzle schema to the development database with:

```text
pnpm --filter @workspace/db run push
```

This was non-destructive. No reset, drop, truncate, recreation, or data
erasure was performed.

## Authentication architecture used

The existing provider-neutral architecture was preserved:

```text
future provider middleware
  -> verified server principal
  -> TenantContext integration point
  -> server-side company/membership lookup
  -> role and capability authorization
  -> scoped data
```

Until that provider middleware is selected and attached, production requests
remain fail-closed. The development header adapter remains available for
seeded local/review workflows only.

## Authorization and security verification

Verified from the current code:

- Production `getTenantContext()` rejects requests before reading development
  workspace headers.
- Company-scoped operational queries use `context.companyId`.
- Employee and manager queries use `employeeScopeCondition(context)`.
- Employee detail access checks the authenticated context employee scope.
- Payroll, devices, subscription, reports, platform, and mutation routes
  derive company and capability checks from `TenantContext`.
- The frontend no longer substitutes a company-owner demo context when the
  workspace query is not authenticated.

## Files/components/routes affected

- `artifacts/var-hr/src/App.tsx`
  - `Shell`
  - new `WorkspaceState`
  - new workspace query status helper
  - localized authentication-state copy
- `artifacts/api-server/src/lib/tenant-context.ts`
  - audited only; no provider or production identity behavior was changed
- `lib/db/src/schema/organization.ts`
  - audited only; no identity schema was invented
- `artifacts/api-server/src/routes/var-hr.ts`
  - audited protected route usage; no route contract was changed
- `hand-off/2026-08-16-agent-part-2-authentication.md`
- `hand-off/MASTER-HANDOFF.md`
- `hand-off/2026-08-16-part-2-auth-boundary-preview.jpg`

## Validation performed

### Typecheck and builds

- `pnpm run typecheck:libs` — PASS
- `pnpm --filter @workspace/api-server run typecheck` — PASS
- `pnpm --filter @workspace/var-hr run typecheck` — PASS
- `pnpm --filter @workspace/api-server run build` — PASS
- `PORT=22077 BASE_PATH=/ pnpm --filter @workspace/var-hr run build` — PASS
- `git diff --check` could not be run because this imported workspace has no
  Git working tree; no diff-check result is claimed.

### Development runtime

- Existing API workflow restarted successfully on port `8080`.
- Existing VAR HR web workflow remained running on port `22077`.
- `GET /api/healthz` — HTTP 200, `{"status":"ok"}`.
- Development `GET /api/workspace` with Arabic locale — HTTP 200 with
  `locale: "ar"` and `direction: "rtl"`.
- Development dashboard summary — HTTP 200 with seeded operational data.
- VAR HR frontend `/` — HTTP 200.
- Live preview screenshot rendered the existing dashboard:
  `2026-08-16-part-2-auth-boundary-preview.jpg`.

### Production fail-closed runtime

Built and ran a separate production-mode API process on an isolated test port.

- Production `GET /api/workspace` without a provider principal — HTTP 401,
  `WORKSPACE_AUTH_REQUIRED`.
- Production `GET /api/workspace` with development tenant/role/employee
  headers — HTTP 401, `WORKSPACE_AUTH_REQUIRED`.
- Production `GET /api/healthz` — HTTP 200.

The managed API workflow was restarted afterward so the normal development
workflow rebuilt and served its expected development adapter.

## Browser/runtime results and known limitations

- The existing browser preview rendered the English dashboard successfully.
- The static preview tool does not provide interactive login/logout or locale
  switching, so loading/unauthorized frontend states were validated from the
  implementation and API behavior, not claimed as interactive screenshots.
- The pre-existing `Overview` React hook-order warning remains in browser
  logs. It was not introduced by this authentication-boundary change and was
  intentionally left outside scope.
- Logout cannot be implemented correctly until the selected provider defines
  its session termination endpoint/client contract.

## Exact blocker

The product specification intentionally leaves the production provider
unspecified. The current database also has no checked-in mapping from an
external authenticated subject to a company membership and role. Choosing a
provider or adding a guessed identity model would violate the Part 2 brief and
could weaken tenant isolation.

## Exact remaining work for the next agent

1. Obtain the explicit production authentication provider decision.
2. Define the server-side identity-to-company membership mapping, including
   Platform Owner, Company Owner, Manager, and Employee role assignment.
3. Attach verified provider middleware at the existing tenant-context boundary.
4. Resolve company and role from server-side identity/membership data only.
5. Add provider-specific login, logout, session-expiry, and authenticated user
   display behavior to the frontend.
6. Add provider-backed authorization tests for cross-company, manager-scope,
   employee-scope, platform-owner, protected mutation, payroll, device, and
   subscription boundaries.
7. Re-run interactive browser validation for logged-in, logged-out, loading,
   unauthorized, expired-session, and logout states.

## Scope statement

No billing, biometric integration, localization rebuild, database redesign,
major UI redesign, or unrelated Part 3 work was started.