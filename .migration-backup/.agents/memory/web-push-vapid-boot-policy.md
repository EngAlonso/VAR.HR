---
name: Web Push VAPID boot policy
description: Web Push must remain optional at API startup and fail clearly only when delivery is requested.
---

Web Push VAPID configuration is lazy: the API can boot and serve authenticated
notification history/subscription routes without VAPID values, while send
operations return an explicit configuration error until the secrets exist.

**Why:** Development, schema checks, and non-delivery notification operations
must remain available before each environment has its own VAPID key pair.

**How to apply:** Keep VAPID secrets in the environment, never log their
values, and initialize the Web Push client at delivery time rather than during
module import or server startup.