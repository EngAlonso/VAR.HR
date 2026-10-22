---
name: Vercel and Replit data separation
description: Keep production data and scheduled work on the environment the HR interface actually uses.
---

The ADMS Bridge currently targets the Vercel site, while the Replit workspace uses its development API and database. Treat these as separate environments unless their database configuration is explicitly verified to be shared.

**Why:** A successful `/iclock` response from Vercel does not prove that records or device commands will appear in the Replit workspace database. This can make the device look connected while the HR interface remains unchanged.

**How to apply:** Before debugging biometric ingestion, verify the Bridge target, the UI/API deployment, and the database connection belong to the same environment. Do not change the Bridge key or URL as a first step; first align the deployed app/database.

## Vercel production database

The user confirmed that Vercel production currently uses Aiven. Replit development and production databases are separate from this external database.

**Why:** Vercel production reported missing columns that were already present in the Replit workspace schema.

**How to apply:** For Vercel schema issues, verify and migrate the confirmed Aiven database through its approved access path. Never assume a Replit schema push or deployment changes Aiven, and never point Vercel at another database without an explicit, verified cutover.

As of 2026-10-22, Aiven production had no Drizzle migration-history table. Node TLS also required the Aiven CA PEM to be normalized into standard wrapped lines before connecting.

**Why:** Replaying Drizzle migrations without a known baseline could apply the entire history, and weakening TLS verification would make a production schema change unsafe.

**How to apply:** Inspect the current Aiven schema before any migration; do not run `drizzle-kit migrate` until a valid migration baseline exists. Keep TLS certificate verification enabled and normalize PEM formatting rather than bypassing it.

## Schema changes during builds

Do not run `drizzle-kit push` as part of Vercel's build command. Keep builds independent of database availability and apply schema changes explicitly to a verified target.

**Why:** Vercel and Replit may use different database credentials; an automatic build-time push can fail before deployment or mutate the wrong environment.

**How to apply:** Keep schema synchronization as a deliberate operation, then build and deploy without a database write step.

## Scheduled work across hosting environments

Keep schedule policy in the database and make the work itself callable independently of the hosting provider. Long-running Node servers can run a local polling loop; serverless environments need a provider cron or external scheduler to invoke a protected endpoint. Use `CRON_SECRET` to authenticate those invocations. Replit development and production Vercel may use different databases, so a scheduler running in the wrong environment does not protect production data.

Vercel Cron expressions are always UTC, while Cairo alternates between UTC+2 and UTC+3. To run the daily backup at 13:00 Cairo in both seasons, schedule checks at 10:00 and 11:00 UTC; the timezone-aware due check must create at most one backup per Cairo day. A cron earlier than both times can return successfully while creating no backup.

**Why:** Serverless functions do not provide a durable in-process timer, and an unauthenticated scheduled-work endpoint can be triggered by arbitrary callers. A fixed UTC cron time also does not follow Cairo's daylight-saving changes.

**How to apply:** Verify which database contains live data before enabling automatic backups. On Vercel, configure `CRON_SECRET` in the production environment and activate cron changes with a production deployment; on another serverless host, connect its cron service to the same authenticated endpoint. Keep cadence choices within the trigger frequency supported by the host.

Vercel registers Cron Jobs from the production deployment's `vercel.json`. Delivery is best-effort, and Vercel does not retry a failed invocation; a missing invocation log means the backup handler did not run.

**Why:** Changing backup execution code cannot repair a Cron Job that is absent, disabled, or not part of the active production deployment.

**How to apply:** Check the production Cron Jobs list and invocation logs before debugging backup logic. Redeploy after changing Cron configuration, and keep the handler idempotent so a later successful invocation can catch up safely. See [Vercel Cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

## Future Aiven schema migrations

The user wants new schema changes to reach Vercel's Aiven production database automatically and safely, with migrations tested against development first. Vercel redeploys after changes are pushed to GitHub. Do not run DDL in the Vercel build or application startup. Aiven currently has existing application tables but no Drizzle migration-history table; do not replay the existing migration history before verifying the live schema and establishing a baseline.

**Why:** Replaying old migrations against a populated database with no migration ledger can modify or conflict with existing tables. The Replit databases are separate from Aiven.

**How to apply:** Verify the exact Aiven target and compare its schema with the latest Drizzle snapshot before baselining. Test each new migration on development first, then apply through a separate migration workflow. Verify database-role permissions rather than trusting a connection's "read-only" label; use a read-only transaction for schema audits and keep Vercel builds/startup free of DDL.