# VAR HR — Part 7 Account-Transfer Handoff
# Date: 2026-08-17

## Transfer status

This is a documentation-only transfer. No Part 7 feature code, schema push,
dependency installation, workflow, artifact, or database mutation was
performed during this transfer.

The repository is not at the same runtime state described by some older
handoffs. The current checked-out source and current environment are the
authority for continuation.

## Project status and authoritative project

The authoritative project is the root pnpm monorepo:

- `artifacts/var-hr` — the VAR HR React/Vite frontend.
- `artifacts/api-server` — the shared Express API.
- `lib/db` — Drizzle/PostgreSQL schema and database package.
- `lib/api-spec` — OpenAPI source contract.
- `lib/api-zod` — generated server-side Zod outputs.
- `lib/api-client-react` — generated React API client/hooks.

The numbered directories such as `6-Var-Hr-System-main`,
`7-Var-Hr-System-main`, `10-Var-Hr-System-main`, and
`32-Var-Hr-System-main` are not additional runnable project copies. They
contain uploaded prompt/asset bundles, generally only an `attached_assets`
directory. They are historical context, not authoritative source.

The current worktree has no product-code changes. Its only untracked file is
the newly uploaded instruction:

```text
attached_assets/Pasted-Execute-the-Part-7-account-transfer-handoff-now-Do-NOT-_1786997502339.txt
```

## Phase 7 payroll integration update

The payroll portion of the Phase 7 continuation is complete for the existing
attendance/payroll architecture. Payroll now reads the company-scoped stored
attendance calculation rows for the period rather than recomputing attendance
metrics from raw attendance events. This means Phase 3 effective schedule and
rule results, Phase 4 permission coverage and penalty results, and Phase 6
approved attendance-time adjustments are each applied once.

Approved leave dates and company-effective schedules/holidays remain inputs to
the absence-day boundary. Leave balances are read without mutating the leave
ledger during payroll calculation; the approved leave requests and the
allocated/used/pending/remaining balances are included in the immutable payroll
inputs snapshot and exposed in the payroll employee details. Payroll
adjustments remain a separate payroll-only input and finalized/locked periods
continue to return their stored calculation without recalculation.

The payroll contract and generated client/Zod outputs include leave-day and
leave-balance detail, and the Payroll screen displays those values.

Focused verification completed:

- API-spec code generation — PASS.
- Full workspace typecheck — PASS.
- API typecheck and production build — PASS.
- VAR HR typecheck and production build with managed `PORT`/`BASE_PATH` —
  PASS.
- Diff whitespace validation — PASS.

Runtime/browser and broader Phase 8/final testing were intentionally not
started in this continuation. No biometric, HR-record, or unrelated Phase 7
systems were changed.

Git history contains only the project initialization commits for the
Part-7-shaped files. There is no separate Part 7 implementation commit from
which to reconstruct a previous agent's exact patch. Treat the source tree,
not an assumed diff, as the current implementation state.

## Part 6 baseline to preserve

Parts 1–6 must not be rebuilt or treated as invalidated by this transfer.
The historical Part 6 reports document the following as actually validated
before the current environment drift:

- Six report types: employees, attendance, leave, permission, overtime, and
  payroll.
- Server-side report filtering, company isolation, employee scoping, manager
  department scoping, payroll restrictions, and cross-company rejection.
- Payroll period calculation/reporting and finalized-period mutation
  protection.
- Authorization boundary behavior and the provider-neutral production
  fail-closed behavior.
- Employee import validation, duplicate handling, row-level results, and
  atomic rollback behavior.
- API health/runtime checks and Arabic workspace locale/RTL responses.
- Frontend HTTP smoke test.
- Full workspace/shared-library typechecks.
- API production build.
- VAR HR frontend production build with the required `PORT`/`BASE_PATH`.
- Component preview production build.

These are historical PASS results recorded in:

- `hand-off/2026-08-17-part-5-payroll-runtime-validation.md`
- `hand-off/2026-08-17-part-6-reports-import-runtime-validation.md`
- `hand-off/2026-08-17-part-6-runtime-completion.md`
- `hand-off/MASTER-HANDOFF.md`

They were not rerun during this transfer because the current checkout has no
installed dependencies, no running workflows, and no `var_hr_*` tables in the
development database. The current environment limitation must not be
misreported as a regression in the previously validated source behavior.

## Part 7 objective

Part 7 is a gap-filling phase, not a rebuild. Its identified goals are:

1. Employee-specific schedules/shifts.
2. First-class company holidays.
3. Provider-based biometric integration.
4. Biometric mock/provider behavior and synchronization history.
5. Employee HR records and profile surfaces.
6. Integration of schedules and holidays into attendance and payroll without
   replacing the existing rules or payroll architecture.

## Part 7 requirement classification

### 1. Employee-specific schedules/shifts — PARTIAL

Present in source:

- `lib/db/src/schema/scheduling.ts` defines:
  - `var_hr_work_schedules`
  - `var_hr_employee_schedule_assignments`
- `lib/api-spec/openapi.yaml` contains intended schedule paths:
  - `GET/POST /schedules`
  - `PATCH /schedules/{scheduleId}`
  - `GET/PUT /employees/{employeeId}/schedule`

Not implemented as a usable feature:

- `artifacts/api-server/src/routes/var-hr.ts` has no schedule handlers.
- Attendance uses the single company `attendanceRulesTable` row through
  `attendanceRulesFor()`, not an employee's effective assignment.
- Payroll calculation also consumes the company-level rules and existing
  attendance rows; it does not resolve an employee schedule.
- No generated schedule types, Zod schemas, React client functions, hooks,
  or frontend schedule/shift screen exist.
- Overnight-shift behavior is not implemented or verified.

The schema and intended contract are scaffolding only. This requirement is
not complete.

### 2. Company holidays — PARTIAL

Present in source:

- `lib/db/src/schema/scheduling.ts` defines
  `var_hr_holidays` with company, name, date, and recurring fields.
- `lib/api-spec/openapi.yaml` contains intended holiday CRUD paths.
- Existing company attendance rules still have a legacy
  `holidayDates` array.

Not implemented as a usable first-class feature:

- No holiday handlers exist in `artifacts/api-server/src/routes/var-hr.ts`.
- Attendance checks the legacy rules array, not `var_hr_holidays`.
- No generated holiday client/types/hooks exist.
- No holiday UI exists.
- No holiday seed/test data exists.
- Holiday absence/payroll behavior is not runtime-verified.

### 3. Provider-based biometric integration — PARTIAL

Existing provider-neutral foundation:

- `lib/db/src/schema/integrations.ts` contains device configuration,
  employee mappings, raw biometric events, and sync-history storage.
- Existing device routes support device listing/creation, mappings, raw event
  ingestion, connection-test reporting, and a sync request boundary.
- The device API exposes `adapterKey` and `integrationState`, and newly created
  devices are marked `adapter_pending`.
- The UI correctly presents synchronization as unavailable when no
  manufacturer adapter is configured; it does not claim physical hardware
  success.

Still missing:

- No provider interface/registry implementation is present.
- No provider adapter resolution is performed from `adapterKey`.
- No deterministic mock provider is present.
- No employee synchronization operation is implemented.
- No provider-backed attendance synchronization pipeline is implemented.
- `POST /devices/{deviceId}/sync` returns `202` with `unavailable` and a
  localized “no manufacturer adapter” message; it does not invoke a provider.

No real hardware integration was tested or claimed.

### 4. Biometric sync history/mock provider — PARTIAL

Present in source:

- `biometricSyncHistoryTable` exists in
  `lib/db/src/schema/integrations.ts`.
- `lib/api-spec/openapi.yaml` declares
  `GET /devices/{deviceId}/sync-history` and a provider-list route.
- Existing raw event ingestion has idempotency and mapped/pending processing
  states.

Still missing:

- No sync-history route or database writes to the history table.
- No provider-list route.
- No generated client/Zod outputs for these contracts.
- No mock provider, deterministic test behavior, or sync-history UI.
- No end-to-end provider-to-attendance processing verification.

### 5. Employee HR records/profile surfaces — PARTIAL

Present in source:

- `lib/db/src/schema/hr-records.ts` defines
  `var_hr_employee_hr_records` with job, employment, manager, address,
  emergency-contact, and notes fields.
- `lib/api-spec/openapi.yaml` declares:
  - `GET /employees/{employeeId}/hr-record`
  - `PUT /employees/{employeeId}/hr-record`
- Existing employee profile routes expose and update the base employee record.

Still missing:

- No HR-record handlers exist in `artifacts/api-server/src/routes/var-hr.ts`.
- No generated HR-record types, Zod schemas, React client functions, or hooks
  exist.
- The Employees modal in `artifacts/var-hr/src/App.tsx` shows only the base
  employee profile fields; it has no HR-record editor or HR-record surface.
- HR-record authorization, employee ownership, manager scope, and
  cross-company behavior are not implemented or verified.

## Existing Part 7 source scaffolding and file status

The following files contain relevant pre-existing scaffolding. They are
tracked in the initialization commit and are not modified in the current
worktree. “Compiles” is not claimed because dependencies are absent and the
canonical typecheck failed before compilation could begin.

| Path | Current state | Missing/dependency | Tested now |
|---|---|---|---|
| `lib/db/src/schema/scheduling.ts` | Schedule, employee assignment, and holiday tables are declared. | No route usage, migration record, seed data, or runtime behavior. | No; source inspected only. |
| `lib/db/src/schema/hr-records.ts` | HR-record table is declared. | No route, generated contract, UI, or authorization behavior. | No; source inspected only. |
| `lib/db/src/schema/integrations.ts` | Device, mapping, raw event, sync-history, and location tables exist. | Provider registry/mock and history writes are absent. | No; source inspected only. |
| `lib/db/src/schema/operations.ts` | Attendance stores schedule snapshots; rules store company-level hours and holiday dates. | Attendance does not resolve first-class employee schedules/holidays. | No; source inspected only. |
| `lib/db/src/schema/index.ts` | Re-exports scheduling and HR-record schemas. | No database application in the current environment. | No; source inspected only. |
| `lib/api-spec/openapi.yaml` | Intended Part 7 paths are drafted. | Several referenced schemas are absent; the `PUT /rules` operation is structurally under the HR-record path in the current YAML. | No codegen; dependencies absent. |
| `lib/api-client-react/src/generated/*` | Existing employee/device/rules client outputs are present. | No schedule, holiday, HR-record, provider-list, or sync-history functions/hooks. | No; generated output inspected only. |
| `lib/api-zod/src/generated/*` | Existing employee/device/rules Zod outputs are present. | No Part 7 schedule/holiday/HR/provider/history schemas. | No; generated output inspected only. |
| `artifacts/api-server/src/routes/var-hr.ts` | Existing Parts 1–6 and Part 4 device routes are present. | No schedule, holiday, HR-record, provider, or sync-history handlers; attendance/payroll still use global rules. | No; API not running. |
| `artifacts/api-server/src/lib/seed.ts` | Existing Northstar/Part 6 seed data and generic pending device exist. | No schedule, holiday, HR-record, provider, or sync-history seed data. | No; database empty. |
| `artifacts/var-hr/src/App.tsx` | Existing employee, attendance, rules, reports, payroll, devices, and other screens exist. | No schedule/holiday/HR-record/provider/history screens or generated hooks. | No browser run. |
| `artifacts/var-hr/.replit-artifact/artifact.toml` | Valid web artifact metadata is present on disk. | Live artifact registry is empty in this environment. | Read-only inspection. |
| `artifacts/api-server/.replit-artifact/artifact.toml` | Valid API artifact metadata is present on disk. | Live workflow registry is empty in this environment. | Read-only inspection. |

## Database/schema state

Current read-only database inspection on 2026-08-17:

- Database reachability: PASS — the database callback reported “Database is
  ready.”
- `information_schema.tables` query for public `var_hr_%` tables: returned no
  rows.
- The six Part 7 tables
  (`var_hr_work_schedules`, `var_hr_employee_schedule_assignments`,
  `var_hr_holidays`, `var_hr_employee_hr_records`,
  `var_hr_biometric_events`, and `var_hr_biometric_sync_history`) are not
  present in the current development database.
- No current Part 7 row counts or seed data can be inspected because the
  tables do not exist.
- No migrations directory or tracked generated migration files are present.
  This project currently uses the Drizzle `push` scripts in
  `lib/db/package.json`.
- No schema push was run during this transfer.
- No destructive database operation was run.

The next agent may need to apply the existing schema non-destructively with
the established development command after dependencies are restored:

```text
pnpm --filter @workspace/db run push
```

That is an environment recovery step, not evidence that Part 7 is
implemented. Do not drop, reset, truncate, recreate, or erase data.

## API/OpenAPI state

### Existing usable routes

The server route file currently contains the existing routes for workspace,
dashboard, departments, branches, employees, attendance, leave, permissions,
rules, reports, employee import, payroll, devices, device mappings, biometric
raw events, attendance locations, subscription, and platform companies.

The existing device route boundary is:

- `GET/POST /api/devices`
- `POST /api/devices/:deviceId/sync`
- `POST /api/devices/:deviceId/connection-test`
- `GET/POST/DELETE /api/devices/:deviceId/mappings...`
- `POST /api/devices/:deviceId/events`

The sync handler intentionally responds as unavailable until a real adapter
exists. It does not create sync-history records.

### Declared but not implemented Part 7 routes

The OpenAPI file declares, but the API route file does not implement:

- `/schedules`
- `/schedules/{scheduleId}`
- `/employees/{employeeId}/schedule`
- `/holidays`
- `/holidays/{holidayId}`
- `/employees/{employeeId}/hr-record`
- `/devices/providers`
- `/devices/{deviceId}/sync-history`

### Contract/codegen inconsistencies

- `WorkSchedule`, `WorkScheduleInput`, `EmployeeSchedule`,
  `EmployeeScheduleInput`, `Holiday`, `HolidayInput`, `EmployeeHrRecord`,
  `EmployeeHrRecordInput`, `BiometricProvider`, and `DeviceSyncHistory` are
  referenced by OpenAPI paths but are not present in the component schema
  inventory observed in `openapi.yaml`.
- The current YAML places `operationId: updateAttendanceRules` as a second
  `put` under `/employees/{employeeId}/hr-record` rather than under `/rules`.
  This must be corrected before reliable code generation.
- The generated libraries contain no Part 7 schedule, holiday, HR-record,
  provider-list, or sync-history outputs. They are therefore stale/incomplete
  relative to the drafted OpenAPI paths.
- Existing generated rules outputs and the existing frontend
  `useUpdateAttendanceRules` hook reflect the older usable `/rules` behavior;
  preserve that behavior while repairing the contract.

### Authorization and tenant isolation

The existing `TenantContext`, `canManageCompany`, capability checks, employee
scope, manager department scope, payroll restrictions, and production
fail-closed authentication boundary are present and must be reused. No
Part 7 route-specific authorization is currently implemented because the
Part 7 routes are missing.

The current role union is:

- `platform_owner`
- `company_owner`
- `manager`
- `employee`

There is no distinct `developer` role in the current implementation. Do not
invent one during continuation without a separate product decision.

## Frontend state

Existing routes in `artifacts/var-hr/src/App.tsx` are:

- `/`
- `/employees`
- `/attendance`
- `/requests`
- `/rules`
- `/reports`
- `/payroll`
- `/devices`
- `/subscription`
- `/platform`

The Employees modal is a base employee profile view with status mutation.
It is not an HR-record editor. The navigation has no schedules, holidays,
provider, sync-history, or HR-record entry.

The frontend imports generated hooks for the existing domains, including
employee, rules, reports, payroll, devices, and attendance locations. It does
not import Part 7 schedule/holiday/HR/provider/history hooks because those
outputs do not exist.

No browser verification was available in this transfer. The live registry
reported no artifacts and no workflows, and no local process was listening on
the inspected ports.

## Runtime, workflow, and artifact state

Observed current environment:

- Node: `v20.20.0`
- pnpm: `10.26.1`
- `pnpm-lock.yaml`: present.
- `node_modules`: absent.
- No Vite, API, or Node application process was found.
- No TCP listeners were found by the read-only listener inspection.
- `artifacts/var-hr/.replit-artifact/artifact.toml` is present and assigns
  local port `22077`.
- `artifacts/api-server/.replit-artifact/artifact.toml` is present and
  assigns local port `8080`.
- The live `listArtifacts()` callback returned `artifacts: []`.
- The live `listWorkflows({})` callback returned `[]`.

The artifact TOML files on disk must not be confused with live registration.
Do not configure duplicate replacement workflows blindly. If runtime
verification is needed later, restore the existing artifact registration
through the supported artifact path, then use the exact managed workflow names
reported by the runtime.

## Verification matrix for this transfer

This table records only evidence from the current transfer. Historical Part 6
PASS results are preserved separately above and are not silently converted
into current runtime verification.

| Area | Status | Evidence |
|---|---|---|
| Database reachability | PASS | Read-only database status reported ready. |
| Current `var_hr_*` schema | FAIL | Information-schema query returned no `var_hr_*` tables. |
| Dependency installation | FAIL | `node_modules` is absent. |
| Full typecheck | FAIL | `pnpm run typecheck` exited 1: `tsc: command not found`. |
| API build | NOT RUN | Dependencies are absent; no build was attempted separately. |
| Frontend build | NOT RUN | Dependencies are absent; no build was attempted separately. |
| Attendance runtime | NOT RUN | No API process/database schema available. |
| Employee schedules | NOT RUN | No handlers or tables in current DB; source inspection only. |
| Overnight schedules | NOT RUN | No implementation or runtime test. |
| Company holidays | NOT RUN | No handlers or tables in current DB; source inspection only. |
| Payroll integration with Part 7 rules | NOT RUN | Existing historical payroll validation was not rerun. |
| Biometric provider/mock | NOT RUN | No provider implementation or runtime available. |
| Biometric sync history | NOT RUN | No handler/writes and no current table. |
| Employee HR records | NOT RUN | No handler/UI/runtime available. |
| Authorization | NOT RUN | Existing historical authorization validation preserved, not rerun. |
| Tenant isolation | NOT RUN | Existing historical isolation validation preserved, not rerun. |
| Reports | NOT RUN | Existing historical six-report validation preserved, not rerun. |
| Employee import | NOT RUN | Existing historical import validation preserved, not rerun. |
| CSV/export/print | NOT RUN | No browser/runtime verification in this transfer. |
| Browser UI | BLOCKED | No registered artifact/workflow and no running service. |

Read-only source/configuration checks did not constitute feature PASS results.

## Known issues and contradictions

1. The older master handoff says artifact/workflow registration was restored,
   while the latest Part 6 report and the current live registry both say the
   registry is empty. The current live registry wins.
2. The current development database is reachable but uninitialized for this
   project. The older schema-push/runtime claims are historical.
3. Dependencies are not installed in the current checkout, so compilation
   cannot currently be assessed.
4. Part 7 OpenAPI paths are ahead of both the component schemas and generated
   outputs.
5. The OpenAPI `updateAttendanceRules` operation is in the wrong path block in
   the current file and must be repaired before codegen.
6. There is no tracked migration history; schema application uses Drizzle
   push. The next agent must preserve the non-destructive database rule.
7. The existing `Overview` React hook-order warning is recorded in prior
   handoffs and was not investigated or changed here.
8. The fixed `TODAY` value and existing company-level rules are pre-existing
   implementation characteristics. Do not silently change them as part of
   the Part 7 handoff; decide scope explicitly when implementing schedule and
   holiday behavior.

## Exact continuation point

The project is at a pre-implementation reconciliation point:

- Part 6 source and historical validation are preserved.
- Part 7 schema declarations and draft OpenAPI paths exist.
- Part 7 server handlers, generated outputs, frontend surfaces, provider/mock
  behavior, and schedule/holiday attendance integration are not complete.
- No current worktree Part 7 patch needs to be continued or reverted.
- The current environment must be restored before runtime validation.

## Recommended next action

The next agent should proceed in this exact order:

1. Restore dependencies with `pnpm install --frozen-lockfile`.
2. Apply the existing Drizzle schema non-destructively with
   `pnpm --filter @workspace/db run push`, only after confirming the current
   development database state remains empty of `var_hr_*` tables.
3. Repair and complete the OpenAPI source first:
   restore the `/rules` update operation to the correct path, define every
   referenced Part 7 component schema, and preserve the existing usable
   rules/device contracts.
4. Run code generation and confirm schedule, holiday, HR-record,
   provider-list, and sync-history client/Zod outputs exist.
5. Add tenant/role-authorized API handlers and a deterministic mock/provider
   boundary, then add frontend screens using the generated hooks.
6. Integrate effective employee schedules and first-class company holidays
   into attendance calculations and payroll inputs without replacing existing
   rule/payroll logic.
7. Run the full typecheck/build/runtime/browser matrix and create a new
   completion or continuation report based only on executed evidence.

## Final summary

1. **Complete:** Historical Parts 1–6 baseline remains documented and must be
   preserved; existing device/raw-event and base employee/profile foundations
   are present.
2. **Partially implemented:** Part 7 schema/draft contract scaffolding,
   provider-neutral device boundary, raw biometric events, and legacy
   company-level attendance rules.
3. **Remaining:** Repair the contract, regenerate outputs, implement schedules,
   holidays, provider/mock and sync history, HR records, UI surfaces,
   attendance/payroll integration, and verification.
4. **Exact next action:** Restore dependencies and the empty development schema
   non-destructively, then repair the OpenAPI Part 7 contract before writing
   handlers or UI.

## Task 2 completion update — 2026-08-17

Task 2 is COMPLETE for the provider/mock synchronization scope. The earlier
pre-implementation notes above are retained as transfer history; the current
source and this section are authoritative for the completed biometric work.

### Files changed

- `artifacts/api-server/src/lib/biometric-provider.ts`
- `artifacts/api-server/src/routes/var-hr.ts`
- `replit.md`

No database schema or OpenAPI contract change was required. The existing
generated outputs were regenerated and remained compatible with the existing
contract.

### Biometric architecture

The existing `adapterKey` boundary now resolves provider adapters through a
single registry. Adapters expose connection/status checking, employee mapping
synchronization, and attendance-event synchronization. The generic adapter
remains explicitly unavailable until a real manufacturer adapter is supplied.

### Mock provider behavior

The `mock` provider is deterministic and does not contact physical hardware. It
returns a stable 09:00 UTC attendance event per active device mapping, with a
stable provider idempotency key. Test-only controlled failures are selected by
the registered device identifier (`mock:fail:connection`,
`mock:fail:employees`, `mock:fail:attendance`, or `mock-failure`).

### Synchronization and history

`POST /api/devices/{deviceId}/sync` remains the existing contract and now:

1. Resolves the provider from the device adapter key.
2. Checks provider/device connection state.
3. Synchronizes company-scoped employee mappings.
4. Fetches provider attendance events.
5. Validates device identity and active company mapping.
6. Writes raw biometric events and maps them into the existing attendance
   table without changing the attendance rules engine.
7. Records employee and attendance sync attempts in
   `var_hr_biometric_sync_history`.

Duplicate provider events are ignored by the existing company/idempotency-key
unique constraint. A repeated sync still creates a new history entry while
creating no duplicate attendance or raw-event row.

### Authorization and tenant isolation

Device administration and synchronization continue to require the existing
company-owner/platform-owner authorization. Every device, mapping, employee,
raw-event, attendance, and history query is scoped to the resolved company.
Employee and manager requests are rejected, and an unknown tenant cannot reach
another company's device data.

### Verification executed

- `pnpm install --frozen-lockfile` — PASS.
- `pnpm --filter @workspace/db run push` — PASS; existing schema applied
  non-destructively.
- `pnpm run typecheck` — PASS.
- `pnpm --filter @workspace/api-server run typecheck` — PASS.
- `pnpm --filter @workspace/api-server run build` — PASS.
- `pnpm --filter @workspace/api-spec run codegen` — PASS.
- Managed API workflow restart and `/api/healthz` — PASS.
- Provider listing and mock connection test — PASS.
- Mock employee synchronization and sync-history creation — PASS.
- Mock attendance synchronization and attendance-row mapping — PASS.
- Repeated identical mock synchronization — PASS; the second attempt created
  history but processed zero new attendance events.
- Controlled provider attendance failure — PASS; the API returned a handled
  `202 unavailable` result and a failed history entry.
- Employee and manager device administration rejection — PASS (`403`).
- Unknown tenant rejection and malformed event validation — PASS (`403` and
  `400`).

The root `pnpm run build` was not marked PASS because the unrelated
`artifacts/mockup-sandbox` production build requires workflow-provided
`PORT`/`BASE_PATH` values when run directly from the shell. The API build and
all Task 2 focused checks passed. No physical biometric hardware was tested.

Task 3 and the Part 7 frontend were not started.

## Biometric mapping runtime continuation — 2026-08-19

The imported checkout did not contain the managed workflow registration or its
runtime logs, so the original Device A stack trace could not be replayed from
this environment. The source-level failure path was confirmed in the existing
mapping handler: generated route schemas accepted `deviceId` and
`employeeId` as generic strings, and the handler passed them directly into
UUID-backed Drizzle queries. A malformed identifier therefore reached
PostgreSQL and could produce an HTTP 500 before the not-found response.

### Minimal fix

The existing `POST /devices/{deviceId}/mappings` handler now validates both
`deviceId` and `employeeId` with the existing `isUuid` helper immediately after
request parsing. Invalid identifiers return the existing `400 invalidRequest`
response before any device, employee, account, mapping, or identity query.
Device-letter allocation, stable A/B codes, generated employee usernames,
password generation, employee limits, tenant isolation, and authentication
were not redesigned or changed.

### Verification

- `pnpm install --frozen-lockfile` — PASS.
- `pnpm run typecheck:libs` — PASS.
- `pnpm --filter @workspace/api-server run typecheck` — PASS.
- `pnpm --filter @workspace/api-server run build` — PASS.
- Managed API workflow restart — BLOCKED; `artifacts/api-server: API Server`
  is not present in the current workflow registry.
- Biometric mapping and remaining authentication runtime matrix — NOT RUN;
  no registered API workflow or captured stack trace/log stream is available
  in this checkout.

### Remaining blocker

Restore/register the existing managed API and web artifacts through the
supported artifact-registration path, then rerun only the Device A mapping
verification and the authentication assertions listed in the continuation
instruction. No claim is made here for those live checks.