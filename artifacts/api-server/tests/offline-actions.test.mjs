import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const route = readFileSync(
  new URL("../src/routes/var-hr.ts", import.meta.url),
  "utf8",
);
const frontend = readFileSync(
  new URL("../../var-hr/src/App.tsx", import.meta.url),
  "utf8",
);
const queue = readFileSync(
  new URL("../../var-hr/src/lib/offline-actions.ts", import.meta.url),
  "utf8",
);
const apiSchema = readFileSync(
  new URL("../../../lib/api-zod/src/generated/api.ts", import.meta.url),
  "utf8",
);
const apiSpec = readFileSync(
  new URL("../../../lib/api-spec/openapi.yaml", import.meta.url),
  "utf8",
);

test("offline employee actions are stored in IndexedDB and replayed in capture order", () => {
  assert.match(queue, /indexedDB\.open/);
  assert.match(queue, /credentials: "include"/);
  assert.match(queue, /sort\(\(a, b\) => a\.createdAt\.localeCompare\(b\.createdAt\)\)/);
  assert.match(queue, /window\.dispatchEvent\(new Event\("varhr-offline-sync-complete"\)\)/);
  assert.match(frontend, /enqueueOfflineAction/);
  assert.match(frontend, /syncOfflineActions/);
  assert.match(frontend, /addEventListener\("online", syncQueue\)/);
});

test("offline attendance actions keep an idempotency key and original GPS capture time", () => {
  assert.match(frontend, /offlineEventId/);
  assert.match(frontend, /capturedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(apiSchema, /"offlineEventId": zod\.uuid\(\)\.optional\(\)/);
  assert.match(route, /savedLocation\?\.offlineEventId === parsed\.data\.offlineEventId/);
  assert.match(route, /offlineEventId: parsed\.data\.offlineEventId/);
});

test("offline attendance replay is limited to recent events and uses the captured company date", () => {
  assert.match(route, /capturedAgeMs > 24 \* 60 \* 60 \* 1000/);
  assert.match(route, /currentCompanyDate/);
  assert.match(route, /eq\(attendanceTable\.date, attendanceDate\)/);
});

test("offline work-location visits preserve capture time and remain separate from attendance", () => {
  assert.match(apiSchema, /"capturedAt": zod\.iso\.datetime/);
  assert.match(apiSpec, /capturedAt: \{ type: \["string", "null"\], format: date-time \}/);
  assert.match(route, /const recordedAt = parsed\.data\.capturedAt/);
  assert.match(route, /workDate: recordedDate/);
  assert.match(queue, /action\.kind === "work-location"/);
});
