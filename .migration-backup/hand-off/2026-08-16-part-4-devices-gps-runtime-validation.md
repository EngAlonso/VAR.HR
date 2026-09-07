# VAR HR — Part 4 Runtime Validation Report

## Date

2026-08-16

## Scope

Continue the existing Part 4 implementation only:

- Biometric devices
- Employee ↔ device mappings
- Raw biometric events
- GPS attendance
- Company attendance locations/geofences
- Server-side authorization and tenant isolation

Parts 1–3 were not restarted, and Part 5 was not started.

## Devices HTTP 500 — confirmed root cause and fix

The development PostgreSQL database initially had no `var_hr_*` tables. The
existing Drizzle schema was applied non-destructively with:

```text
pnpm --filter @workspace/db run push
```

After schema application, `/api/devices` still returned HTTP 500. API logs
identified the second, actual endpoint blocker:

- `ListDevicesResponse.parse` failed in `artifacts/api-server/src/routes/var-hr.ts`.
- `mapDeviceRow()` returned only the display fields.
- The generated OpenAPI/Zod response contract also requires:
  `adapterKey`, `connectionType`, `host`, `port`, and `deviceIdentifier`.
- The omitted values were therefore `undefined`, causing a `ZodError` and the
  generic `INTERNAL_ERROR` response.

Minimal fix:

- Added those five existing `devicesTable` values to `mapDeviceRow()`.
- Preserved the generated contract, schema, database values, and tenant query.
- No unrelated route or frontend redesign was made.

After the fix:

- `GET /api/devices`: HTTP 200
- Device metadata, adapter state, connection state, null network fields, and
  status were returned successfully.

## Database and runtime recovery

- Development database reachable: PASS
- Existing Drizzle schema applied: PASS
- `var_hr_*` tables present: PASS
- No drop, truncate, reset, recreation, or existing-data deletion performed.
- Managed workflows registered and running:
  - `artifacts/api-server: API Server` on port 8080
  - `artifacts/var-hr: web` on port 22077
  - `artifacts/mockup-sandbox: Component Preview Server` on port 8081
- `GET /api/healthz`: HTTP 200, `{"status":"ok"}`

## Biometric device verification

- Device listing: PASS
- Device creation: HTTP 201, PASS
- Device metadata and status: PASS
- Device branch association: PASS
- Provider-neutral adapter state: PASS
- Sync request: HTTP 202 with `unavailable`; no synchronization was simulated.
- Connection test: HTTP 200 with honest `unknown`/unavailable status.
- Employee and manager device-management requests: HTTP 403.
- Unknown tenant access: HTTP 403.

The UI Devices screen was verified in the live preview at desktop and mobile
sizes. It renders the device metadata, adapter-pending state, honest connection
status, and disabled/unavailable sync behavior without a browser console error
from this feature.

## Employee ↔ device mapping verification

- Create mapping: HTTP 201, PASS
- List mapping: HTTP 200, PASS
- Device-specific employee identifier: PASS
- Duplicate mapping: HTTP 409, PASS
- Remove mapping: HTTP 204, PASS
- Employee create/manage attempt: HTTP 403, PASS
- Cross-tenant mapping attempt: HTTP 403, PASS

## Raw biometric event verification

- Raw event storage: HTTP 201, PASS
- Device association: PASS
- Unmapped event remains `pending_adapter`: PASS
- Mapped event resolves `employeeId` and returns `processingStatus: "mapped"`:
  PASS
- Duplicate idempotency key returns the original receipt with `duplicate: true`:
  PASS
- Employee ingestion attempt: HTTP 403, PASS
- Cross-tenant access: HTTP 403, PASS

No physical biometric hardware communication was invented or simulated.

## GPS attendance and geofence verification

- Valid company attendance location creation: HTTP 201, PASS
- Location listing: HTTP 200, PASS
- Invalid latitude: HTTP 400, PASS
- Invalid longitude: HTTP 400, PASS
- Invalid radius: HTTP 400, PASS
- Location deactivation: HTTP 200, PASS
- Location reactivation and radius update: HTTP 200, PASS
- Employee location-management attempt: HTTP 403, PASS
- Missing location under the existing optional GPS policy: accepted with
  `locationStatus: "not_required"`, PASS
- Inside active geofence check-out: `locationStatus: "verified"`, PASS
- Outside active geofence check-out: `locationStatus: "outside_geofence"`, PASS
- Server-side employee context and coordinate validation: PASS
- Unknown tenant location access: HTTP 403, PASS

Browser permission denial/unavailability remains represented by the existing
frontend error/localization path; an interactive permission-denial action was
not available in the static preview capture tool.

## Authorization results

Verified server-side, not only through frontend visibility:

- Company Owner can manage devices and locations.
- Manager cannot manage devices or locations.
- Employee cannot manage devices or locations.
- Employee attendance actions require a valid employee context.
- Manager attendance action is scoped to the manager employee context.
- Unknown tenant requests fail with `WORKSPACE_ACCESS_DENIED`.
- Production authentication remains provider-neutral and fail-closed; no fake
  production user, session, provider, or credentials were created.

## Validation

- Shared-library typecheck: PASS
- Full workspace typecheck: PASS
- API typecheck: PASS
- Frontend typecheck: PASS
- API production build: PASS
- Frontend production build with managed `PORT`/`BASE_PATH`: PASS
- API health: PASS
- Live Devices preview desktop: PASS
- Live Devices preview mobile: PASS

Preview captures:

- `hand-off/2026-08-16-part-4-devices-desktop.jpg`
- `hand-off/2026-08-16-part-4-devices-mobile.jpg`

## Remaining dependencies and status

Development validation created a small number of clearly named validation
device/location/event records. The existing API exposes no device-delete route,
and no destructive database cleanup was performed.

Real biometric synchronization remains unavailable until a real manufacturer
and protocol are selected. Production authentication remains blocked until the
product owner selects an authentication provider and identity-to-company
membership mapping.

**Part 4 status: Complete for the implemented provider-neutral scope; real
hardware synchronization and production authentication remain external
dependencies.**