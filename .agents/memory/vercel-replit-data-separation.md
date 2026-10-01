---
name: Vercel and Replit data separation
description: Keep production data and scheduled work on the environment the HR interface actually uses.
---

The ADMS Bridge currently targets the Vercel site, while the Replit workspace uses its development API and database. Treat these as separate environments unless their database configuration is explicitly verified to be shared.

**Why:** A successful `/iclock` response from Vercel does not prove that records or device commands will appear in the Replit workspace database. This can make the device look connected while the HR interface remains unchanged.

**How to apply:** Before debugging biometric ingestion, verify the Bridge target, the UI/API deployment, and the database connection belong to the same environment. Do not change the Bridge key or URL as a first step; first align the deployed app/database.

## Scheduled work across hosting environments

Keep schedule policy in the database and make the work itself callable independently of the hosting provider. Long-running Node servers can run a local polling loop; serverless environments need a provider cron or external scheduler to invoke a protected endpoint. Use `CRON_SECRET` to authenticate those invocations. Replit development and production Vercel may use different databases, so a scheduler running in the wrong environment does not protect production data.

**Why:** Serverless functions do not provide a durable in-process timer, and an unauthenticated scheduled-work endpoint can be triggered by arbitrary callers. Hosting may change while the schedule and backup logic should remain portable.

**How to apply:** Verify which database contains live data before enabling automatic backups. On Vercel, configure `CRON_SECRET` in the deployment environment; on another serverless host, connect its cron service to the same authenticated endpoint. Keep cadence choices within the trigger frequency supported by the host.