---
name: Vercel and Replit data separation
description: Prevent biometric data from being written to a different environment than the HR interface reads.
---

The ADMS Bridge currently targets the Vercel site, while the Replit workspace uses its development API and database. Treat these as separate environments unless their database configuration is explicitly verified to be shared.

**Why:** A successful `/iclock` response from Vercel does not prove that records or device commands will appear in the Replit workspace database. This can make the device look connected while the HR interface remains unchanged.

**How to apply:** Before debugging biometric ingestion, verify the Bridge target, the UI/API deployment, and the database connection belong to the same environment. Do not change the Bridge key or URL as a first step; first align the deployed app/database.