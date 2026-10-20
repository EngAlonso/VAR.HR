---
name: Vercel and Replit data separation
description: Keep production data and scheduled work on the environment the HR interface actually uses.
---

The ADMS Bridge currently targets the Vercel site, while the Replit workspace uses its development API and database. Treat these as separate environments unless their database configuration is explicitly verified to be shared.

**Why:** A successful `/iclock` response from Vercel does not prove that records or device commands will appear in the Replit workspace database. This can make the device look connected while the HR interface remains unchanged.

**How to apply:** Before debugging biometric ingestion, verify the Bridge target, the UI/API deployment, and the database connection belong to the same environment. Do not change the Bridge key or URL as a first step; first align the deployed app/database.

## Neon-to-Aiven production cutover

The user chose Aiven for VAR HR's Vercel production PostgreSQL after Neon quota limits blocked database queries. They have an older backup and plan to restore it to Aiven. Keep Neon unchanged and do not point Vercel production at the empty Aiven database until the backup has been restored and verified.

**Why:** The user wants to leave Neon while retaining historical data; switching production to an empty database would make the app's accounts and HR records unavailable.

**How to apply:** After the user confirms the restore, verify Aiven's schema and important data before changing Vercel's production `DATABASE_URL`. Replit's managed `DATABASE_URL` is separate and must not be replaced for this Vercel cutover.

## Scheduled work across hosting environments

Keep schedule policy in the database and make the work itself callable independently of the hosting provider. Long-running Node servers can run a local polling loop; serverless environments need a provider cron or external scheduler to invoke a protected endpoint. Use `CRON_SECRET` to authenticate those invocations. Replit development and production Vercel may use different databases, so a scheduler running in the wrong environment does not protect production data.

Vercel Cron expressions are always UTC, while Cairo alternates between UTC+2 and UTC+3. To run the daily backup at 13:00 Cairo in both seasons, schedule checks at 10:00 and 11:00 UTC; the timezone-aware due check must create at most one backup per Cairo day. A cron earlier than both times can return successfully while creating no backup.

**Why:** Serverless functions do not provide a durable in-process timer, and an unauthenticated scheduled-work endpoint can be triggered by arbitrary callers. A fixed UTC cron time also does not follow Cairo's daylight-saving changes.

**How to apply:** Verify which database contains live data before enabling automatic backups. On Vercel, configure `CRON_SECRET` in the production environment and activate cron changes with a production deployment; on another serverless host, connect its cron service to the same authenticated endpoint. Keep cadence choices within the trigger frequency supported by the host.

Vercel registers Cron Jobs from the production deployment's `vercel.json`. Delivery is best-effort, and Vercel does not retry a failed invocation; a missing invocation log means the backup handler did not run.

**Why:** Changing backup execution code cannot repair a Cron Job that is absent, disabled, or not part of the active production deployment.

**How to apply:** Check the production Cron Jobs list and invocation logs before debugging backup logic. Redeploy after changing Cron configuration, and keep the handler idempotent so a later successful invocation can catch up safely. See [Vercel Cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs).