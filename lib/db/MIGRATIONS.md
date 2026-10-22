# Database migration workflow

This repository has two separate PostgreSQL targets:

- Replit's `DATABASE_URL` is the development database.
- Vercel production uses Aiven. Its migration-only connection is `AIVEN_MIGRATION_DATABASE_URL`, with `AIVEN_CA_CERT` for verified TLS.

Never use `drizzle-kit push` for schema changes. It bypasses the committed migration history and is not part of app startup or the Vercel build.

## Make and test a schema change

1. Update the Drizzle schema in `src/schema/`.
2. Generate a SQL migration:

   ```sh
   pnpm --filter @workspace/db run generate
   ```

3. Review the generated SQL for unintended changes, especially drops, renames, table recreation, and data updates. Commit the SQL and matching files under `migrations/meta/`.
4. Apply it to Replit development:

   ```sh
   pnpm --filter @workspace/db run migrate:dev
   ```

   Post-merge setup runs this same development-only command. The command reads only `DATABASE_URL`; it rejects `EXTERNAL_DATABASE_URL`, Aiven hosts, and Vercel.
5. Run the app checks and exercise the feature against development before production.

The first development migration run needs a one-time baseline if the database already has the schema but no `drizzle.__drizzle_migrations` table. Compare it to the latest snapshot first, then run:

```sh
pnpm --filter @workspace/db run baseline:dev -- --confirm-dev-baseline
```

The baseline writes one Drizzle history row for the latest migration. It does not replay historical SQL or change application tables.

## Inspect and baseline existing Aiven production

The old SQL history must not be replayed against an Aiven database whose current state is unknown. In particular, an empty Drizzle history table is not evidence that the application schema is empty.

1. Add the Aiven migration URL and CA certificate to Replit Secrets as `AIVEN_MIGRATION_DATABASE_URL` and `AIVEN_CA_CERT`. Do not reuse `DATABASE_URL` or point `EXTERNAL_DATABASE_URL` at the migration command.
2. Create a read-only inspection report:

   ```sh
   pnpm --filter @workspace/db run inspect:aiven
   ```

   It records the database name, migration ledger, column definitions, indexes, constraints, and a schema fingerprint in `migrations/meta/aiven-baseline-report.json`. It does not write to Aiven.
3. Confirm the report is for the intended Aiven database. The tool selects the newest available Drizzle snapshot whose table/column names, PostgreSQL types, and nullability match the live schema. Review indexes, foreign keys, checks, defaults, and any reported differences against that snapshot as well. If no snapshot matches, stop and reconcile the schema before baselining.
4. Take/verify a production backup. After the inspection and schema comparison are approved, establish the baseline:

   ```sh
   pnpm --filter @workspace/db run baseline:aiven -- --confirm-aiven-baseline
   ```

   This operation creates only `drizzle.__drizzle_migrations` and inserts the hash and timestamp for the matched snapshot migration. It does not apply migrations `0000` through the baseline migration or alter application tables. It refuses a stale inspection, schema mismatch, or existing migration ledger.
5. Keep the resulting report with the project. It records the baseline migration and the fingerprint that later migration runs must match.

The baseline does not have to be the newest migration in the repository. For example, if production matches `0009` while development already has `0010`, the baseline records `0009`; the tested `0010` remains pending for the explicit Aiven migration step.

## Apply a tested migration to Aiven

After the migration is committed and has been applied to development, confirm the production backup and run:

```sh
pnpm --filter @workspace/db run migrate:aiven -- --confirm-aiven-production
```

The command requires an explicit production flag, a baselined Aiven report, a matching live schema fingerprint, and every pending migration hash in the development migration ledger. Drizzle then records each applied migration in Aiven's `drizzle.__drizzle_migrations` table.

Do not put this command in `vercel.json`, a Vercel build, an API startup hook, or an unreviewed deployment hook. The Vercel build and all application starts must remain free of schema-changing DDL.
