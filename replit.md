# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run generate` — generate a reviewed SQL migration from schema changes
- `pnpm --filter @workspace/db run migrate:dev` — apply committed migrations to Replit development
- `pnpm --filter @workspace/db run inspect:dev` — read-only check before the one-time development baseline
- `pnpm --filter @workspace/db run inspect:aiven` — read-only Aiven schema and migration-history report
- `pnpm --filter @workspace/db run baseline:aiven -- --confirm-aiven-baseline` — record a reviewed Aiven baseline without replaying old migrations
- `pnpm --filter @workspace/db run migrate:aiven -- --confirm-aiven-production` — apply migrations already tested in development
- Replit provides `DATABASE_URL` for development. Development migration commands reject Aiven and `EXTERNAL_DATABASE_URL`.
- Aiven migration commands use the separate `AIVEN_MIGRATION_DATABASE_URL` and `AIVEN_CA_CERT` secrets, require verified TLS, and never fall back to `DATABASE_URL`.
- The API startup and `vercel.json` build do not run database DDL. Post-merge setup applies only committed migrations to the development database; Aiven requires an explicit, reviewed command.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
