# VAR HR

VAR HR is a multilingual, multi-tenant HR operations workspace for managing employees, attendance, leave, permissions, reports, payroll foundations, devices, and subscription limits.

## Run & Operate

- `pnpm install --frozen-lockfile` — install the existing workspace lockfile
- `pnpm --filter @workspace/var-hr run dev` — run the Vite web workspace
- `pnpm --filter @workspace/api-server run dev` — run the API server (managed workflow port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (provided by the Replit database)
- The API startup runs the existing `@workspace/db` Drizzle push before the existing demo-data bootstrap, so fresh environments initialize schema before authenticated routes are served.
- The managed artifact workflows are `artifacts/var-hr: web`, `artifacts/api-server: API Server`, and `artifacts/mockup-sandbox: Component Preview Server`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/var-hr` — React + Vite frontend and product navigation
- `artifacts/api-server` — Express API routes and demo-data initialization
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/api-zod` — generated server validation schemas
- `lib/api-client-react` — generated React Query hooks
- `lib/db/src/schema` — Drizzle/PostgreSQL schema
- `artifacts/var-hr/src/index.css` — frontend theme tokens

## Architecture decisions

- API paths are served under `/api` and the frontend uses relative generated-client URLs so the managed artifact proxy handles local and published routing.
- Authentication uses server-side PostgreSQL sessions with signed-in account lookup, HttpOnly cookies, eight-hour expiry, password hashing via Node `scrypt`, and authentication audit events.
- Platform Owners are separate from Company Owners. Staff accounts are company-scoped and receive explicit permission grants; employee accounts are linked to persistent biometric identities and use generated six-digit passwords.
- Workspace context is resolved from the authenticated session and fails closed when no active account is present. Company-scoped queries never trust client-selected company headers.
- Company-scoped queries always resolve the tenant server-side from the workspace context before reading or writing records.
- Date-only API fields remain ISO calendar strings (`YYYY-MM-DD`); date-time fields remain offset-aware ISO timestamps.
- Biometric devices use a provider-neutral adapter boundary. Generic devices remain adapter-pending, while the deterministic mock provider can be used for local synchronization verification without physical hardware.

## Product

The current operational foundation includes a company-owner workspace with employee, department, branch, attendance, leave, permission, attendance-rule, report, payroll-calculation, device, subscription, and platform-owner surfaces. Seeded Northstar Logistics data is available for development validation.

## User preferences

The product should feel premium, precise, enterprise-grade, multilingual, and suitable for both LTR and RTL locales. Preserve the existing structure and contract-first API workflow.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Apply the development schema with `pnpm --filter @workspace/db run push` before starting the API in a fresh database.
- The API repeats this non-destructive schema check at startup; initialized databases are left intact and the existing bootstrap remains idempotent.
- Use managed artifact workflows rather than creating replacement workflows.
- Do not introduce an auth provider or claim physical biometric hardware success. The deterministic mock provider is intentionally limited to local/test synchronization.
- Development seed credentials are created only for local validation; set `VAR_HR_PLATFORM_PASSWORD` and `VAR_HR_OWNER_PASSWORD` when overriding them.
- Passwords are returned only as one-time temporary values from account creation/reset/onboarding responses and are never persisted in plaintext.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
