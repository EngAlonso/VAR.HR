import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const authRoute = readFileSync(
  new URL("../src/routes/auth.ts", import.meta.url),
  "utf8",
);
const appSource = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);

const provisioningRoute = authRoute.slice(
  authRoute.indexOf('router.post(\n  "/auth/provision/platform-owner"'),
  authRoute.indexOf('router.get("/auth/me"'),
);
const authGate = appSource.slice(
  appSource.indexOf("function AuthGate()"),
  appSource.indexOf("function WorkspaceState("),
);

test("initial founder provisioning requires the production flag and owner absence", () => {
  assert.match(
    provisioningRoute,
    /process\.env\.NODE_ENV !== "production" \|\|\s*process\.env\.VAR_HR_ENABLE_INITIAL_PROVISIONING === "true"/,
  );
  assert.match(provisioningRoute, /res\.status\(404\)\.json/);
  assert.match(provisioningRoute, /eq\(userAccountsTable\.accountType, "platform_owner"\)/);
  assert.match(provisioningRoute, /pg_advisory_xact_lock/);
});

test("empty database redirects unauthenticated users to founder setup", () => {
  assert.match(
    authGate,
    /if \(loading \|\| account \|\| !setupAvailable\) return;/,
  );
  assert.match(authGate, /location === "\/" \|\| location === "\/login"/);
  assert.match(authGate, /setLocation\("\/setup"\)/);
});

test("completed founder setup disables the setup redirect", () => {
  assert.match(authGate, /setSetupAvailable\(false\);\s*setLocation\("\/login"\)/);
});