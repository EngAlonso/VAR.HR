import { Router, type Request, type Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, auditLogsTable, biometricEventsTable, biometricSyncHistoryTable, companiesTable, deviceEmployeeMappingsTable, devicesTable } from "@workspace/db";
import { applyProviderAttendanceEvent } from "./var-hr";

const router = Router();
const allowUnauthenticated = () => process.env.ZKTECO_ADMS_ALLOW_UNAUTHENTICATED === "true";

function value(req: Request, key: string): string | undefined {
  const result = req.query[key];
  return typeof result === "string" && result.trim() ? result.trim() : undefined;
}

function suppliedKey(req: Request): string | undefined {
  const authorization = req.header("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer || req.header("x-zkteco-key") || value(req, "KEY") || value(req, "token");
}

function keyMatches(stored: string | null, supplied: string | undefined): boolean {
  if (!stored || !supplied) return false;
  const digest = createHash("sha256").update(supplied).digest("hex");
  const left = Buffer.from(stored, "utf8");
  const right = Buffer.from(digest, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

async function deviceFor(req: Request) {
  const sn = value(req, "SN") || value(req, "sn");
  if (!sn) return null;
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.deviceIdentifier, sn)).limit(1);
  if (!device || device.adapterKey !== "zkteco-adms" || device.manufacturer.trim().toLowerCase() !== "zkteco") return null;
  if (!allowUnauthenticated() && !keyMatches(device.registrationKeyHash, suppliedKey(req))) return undefined;
  return device;
}

async function audit(companyId: string, action: string, deviceId: string, after: unknown) {
  await db.insert(auditLogsTable).values({
    companyId, actorType: "system", actorId: "system", action, entityType: "device", entityId: deviceId, before: null, after,
  });
}

async function heartbeat(req: Request, res: Response) {
  const device = await deviceFor(req);
  if (device === undefined) { res.status(401).type("text").send("ERROR"); return; }
  if (!device) { res.status(404).type("text").send("ERROR"); return; }
  const now = new Date();
  await db.update(devicesTable).set({ lastHealthCheck: now, connectionState: "connected", status: "connected", integrationState: "configured" })
    .where(eq(devicesTable.id, device.id));
  await db.insert(biometricSyncHistoryTable).values({ companyId: device.companyId, deviceId: device.id, providerKey: "zkteco-adms", operation: "heartbeat", status: "completed", message: "ADMS heartbeat received.", startedAt: now, completedAt: new Date() });
  await audit(device.companyId, "heartbeat", device.id, { protocol: "zkteco-adms" });
  res.type("text").send("OK");
}

router.get("/ping", heartbeat);
router.get("/getrequest", heartbeat);
router.post("/devicecmd", heartbeat);
router.get("/registry", heartbeat);
router.post("/registry", heartbeat);
router.post("/push", heartbeat);

router.get("/cdata", heartbeat);
router.post("/cdata", async (req, res) => {
  const device = await deviceFor(req);
  if (device === undefined) { res.status(401).type("text").send("ERROR"); return; }
  if (!device) { res.status(404).type("text").send("ERROR"); return; }
  const raw = typeof req.body === "string" ? req.body : new URLSearchParams(req.body as Record<string, string>).toString();
  const rows = raw.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
  let accepted = 0; let rejected = 0; let duplicates = 0;
  const now = new Date();
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, device.companyId)).limit(1);
  if (!company) { res.status(404).type("text").send("ERROR"); return; }
  const context = { companyId: device.companyId, company };
  for (const line of rows) {
    const fields = line.split("\t");
    if (fields.length < 5) { rejected++; continue; }
    const [pin, timestamp, status, verify, workcode] = fields.map((part) => part.trim());
    const occurredAt = new Date(timestamp.replace(" ", "T") + (/[zZ]|[+-]\d\d:\d\d$/.test(timestamp) ? "" : "Z"));
    const statusNumber = Number(status);
    const direction = [0, 4, 5].includes(statusNumber) ? "in" : [1, 2, 3].includes(statusNumber) ? "out" : null;
    if (!pin || !timestamp || !Number.isFinite(statusNumber) || !direction || Number.isNaN(occurredAt.getTime())) { rejected++; continue; }
    const idempotencyKey = createHash("sha256").update([device.deviceIdentifier, pin, timestamp, status, verify, workcode].join("|")).digest("hex");
    const [mapping] = await db.select().from(deviceEmployeeMappingsTable).where(and(eq(deviceEmployeeMappingsTable.companyId, device.companyId), eq(deviceEmployeeMappingsTable.deviceId, device.id), eq(deviceEmployeeMappingsTable.deviceEmployeeId, pin), eq(deviceEmployeeMappingsTable.active, true))).limit(1);
    const [event] = await db.insert(biometricEventsTable).values({ companyId: device.companyId, deviceId: device.id, deviceEmployeeId: pin, employeeId: mapping?.employeeId ?? null, occurredAt, eventType: "attendance", direction, idempotencyKey, rawPayload: { protocol: "zkteco-adms", PIN: pin, timestamp, status, verify, workcode }, processingStatus: mapping ? "received" : "rejected" }).onConflictDoNothing({ target: [biometricEventsTable.companyId, biometricEventsTable.idempotencyKey] }).returning();
    if (!event) { duplicates++; continue; }
    if (!mapping) { rejected++; continue; }
    try {
      await applyProviderAttendanceEvent(context, { deviceEmployeeId: pin, occurredAt, eventType: "attendance", direction, idempotencyKey, rawPayload: {} }, mapping.employeeId);
      await db.update(biometricEventsTable).set({ processingStatus: "mapped", processedAt: new Date() }).where(eq(biometricEventsTable.id, event.id));
      accepted++;
    } catch { rejected++; await db.update(biometricEventsTable).set({ processingStatus: "failed", processedAt: new Date() }).where(eq(biometricEventsTable.id, event.id)); }
  }
  await db.update(devicesTable).set({ lastHealthCheck: now, lastSync: now, connectionState: "connected", status: rejected ? "attention" : "connected", integrationState: "configured" }).where(eq(devicesTable.id, device.id));
  await db.insert(biometricSyncHistoryTable).values({ companyId: device.companyId, deviceId: device.id, providerKey: "zkteco-adms", operation: "attendance_sync", status: rejected ? "failed" : "completed", message: `ADMS upload: ${accepted} accepted, ${duplicates} duplicate, ${rejected} rejected.`, eventsReceived: rows.length, eventsProcessed: accepted, errorCount: rejected, startedAt: now, completedAt: new Date() });
  if (accepted) await audit(device.companyId, "accepted_upload", device.id, { accepted });
  if (rejected) await audit(device.companyId, "rejected_upload", device.id, { rejected });
  if (duplicates) await audit(device.companyId, "duplicate_upload", device.id, { duplicates });
  res.type("text").send(rejected ? "ERROR" : "OK");
});

export default router;