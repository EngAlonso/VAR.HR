# Database migration workflow

This repository has two separate PostgreSQL targets:

- Replit's `DATABASE_URL` is the development database.
- Vercel production uses Aiven. Its migration-only connection is `AIVEN_MIGRATION_DATABASE_URL`, with `AIVEN_CA_CERT` for verified TLS.

For normal schema changes, never use `drizzle-kit push`: it bypasses the committed migration history. It is used only by a guarded, one-time bootstrap when the Replit development database has no application tables or migration history. That bootstrap creates the known `0009` development schema, records the matching migration baseline, and then applies pending migrations through Drizzle. It never runs against Aiven, Vercel, or a non-empty development schema.

## Make and test a schema change

1. Update the Drizzle schema in `src/schema/`.
2. Generate a SQL migration:

   ```sh
   pnpm --filter @workspace/db run generate
   ```

3. The generation command temporarily hides the Aiven status report from Drizzle's snapshot scanner, then restores it. Review the generated SQL for unintended changes, especially drops, renames, table recreation, and data updates. Commit the SQL and matching files under `migrations/meta/`.
4. Apply it to Replit development:

   ```sh
   pnpm --filter @workspace/db run migrate:dev
   ```

   Post-merge setup runs this same development-only command. The command reads only `DATABASE_URL`; it rejects `EXTERNAL_DATABASE_URL`, Aiven hosts, and Vercel. On a completely empty development database it bootstraps the checked-in `0009` schema, records that baseline, and then runs the pending committed migrations. Existing application tables without migration history require an explicit inspection and baseline; they are never auto-synchronized.

5. Run the app checks and exercise the feature against development before production.

If a development database already has application tables but no migration history, compare it to the newest matching snapshot first, then run:

```sh
pnpm --filter @workspace/db run baseline:dev -- --confirm-dev-baseline
```

The baseline writes one Drizzle history row for the matching migration. It does not replay historical SQL or change application tables. Do not baseline an empty database with an application migration version; the guarded empty-database bootstrap handles that case.

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

5. Keep the resulting report with the project. It records the baseline migration and the fingerprint that later migration runs must match. A later inspection preserves the baseline state only when the database, schema fingerprint, and baseline ledger entry remain unchanged.

The baseline does not have to be the newest migration in the repository. For example, if production matches `0009` while development already has `0010`, the baseline records `0009`; the tested `0010` remains pending for the explicit Aiven migration step.

## Apply a tested migration to Aiven (manual fallback)

After the migration is committed and has been applied to development, confirm the production backup and run:

```sh
pnpm --filter @workspace/db run migrate:aiven -- --confirm-aiven-production
```

The command requires an explicit production flag, a baselined Aiven report, a matching live schema fingerprint, and every pending migration hash in the development migration ledger. Drizzle then records each applied migration in Aiven's `drizzle.__drizzle_migrations` table.

Do not put this command in `vercel.json`, a Vercel build, an API startup hook, or an unreviewed deployment hook. The Vercel build and all application starts must remain free of schema-changing DDL.

## Protected GitHub pull-request flow

The repository workflow at `.github/workflows/database-migrations.yml` automates the checks and approval gate:

1. Every pull request targeting `main` runs typechecking, verifies that the Drizzle schema has committed migration files, and applies the migrations to an isolated PostgreSQL development database.
2. If database files changed, the Aiven job waits for approval in the protected `aiven-production` GitHub environment. The reviewer must verify a recent Aiven backup before approving.
3. After approval, the job applies and verifies the migration on Replit development, then applies it to Aiven and records the refreshed baseline report on the pull request. This happens before merging to `main`, so Vercel's production deployment starts only after the database is ready.

One-time GitHub repository setup:

- Create an environment named `aiven-production` and require an authorized reviewer. The workflow is limited to pull requests targeting `main` from this repository.
- Add these environment secrets: `REPLIT_DEV_DATABASE_URL`, `AIVEN_MIGRATION_DATABASE_URL`, and `AIVEN_CA_CERT`. These are separate from Replit Secrets; never put their values in workflow files or pull requests.
- Allow the workflow's `GITHUB_TOKEN` to write repository contents so it can save the updated report to the pull request.
- Protect `main` and require the `Aiven migration approved` status. For database changes, this status is set only after the CI migration test, the protected approval, and the Aiven migration succeed. For pull requests without database changes, it is set after the CI checks pass.

Pull requests from forks can run the isolated test but cannot access production secrets or apply migrations. Open the production change from a branch in this repository.

The GitHub job applies production schema changes before the pull request is merged. Keep migrations backward-compatible and additive; handle destructive changes through a staged migration and explicit review. Vercel builds and application startup remain free of DDL.
