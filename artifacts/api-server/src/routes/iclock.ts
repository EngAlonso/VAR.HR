// @ts-nocheck
import { Router, type Request, type Response } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db, auditLogsTable, biometricEventsTable, biometricSyncHistoryTable, companiesTable, deviceEmployeeMappingsTable, devicesTable } from "@workspace/db";
import { biometricDeviceCommandsTable } from "@workspace/db";
import { parseDeviceTimestamp } from "../lib/device-time";
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

type ParsedAdmsRow = {
  pin: string;
  timestamp: string;
  status: string;
  verify: string;
  workcode: string;
};

function parseAdmsRow(line: string): ParsedAdmsRow | null {
  let decoded = line.trim();
  try {
    decoded = decodeURIComponent(decoded.replace(/\+/g, " "));
  } catch {
    // Keep the original line so the caller can record a useful rejection.
  }

  const fields = decoded.split("\t").map((part) => part.trim());
  const keyValues = new Map<string, string>();
  for (const field of fields) {
    const separator = field.indexOf("=");
    if (separator <= 0) continue;
    keyValues.set(field.slice(0, separator).trim().toLowerCase(), field.slice(separator + 1).trim());
  }

  const valueFor = (...names: string[]) => {
    for (const name of names) {
      const value = keyValues.get(name.toLowerCase());
      if (value !== undefined) return value;
    }
    return "";
  };

  const keyValuePin = valueFor("pin", "userid", "user_id", "user");
  const keyValueTimestamp = valueFor("datetime", "date_time", "timestamp", "time");
  const keyValueStatus = valueFor("status", "state");
  if (keyValuePin && keyValueTimestamp && keyValueStatus) {
    return {
      pin: keyValuePin,
      timestamp: keyValueTimestamp,
      status: keyValueStatus,
      verify: valueFor("verify", "verification"),
      workcode: valueFor("workcode", "work_code"),
    };
  }

  if (fields.length >= 5 && fields[0] && fields[1] && fields[2]) {
    return {
      pin: fields[0],
      timestamp: fields[1],
      status: fields[2],
      verify: fields[3] ?? "",
      workcode: fields[4] ?? "",
    };
  }

  return null;
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

async function repairRejectedEvents(
  device: typeof devicesTable.$inferSelect,
  context: { companyId: string; company: typeof companiesTable.$inferSelect },
) {
  const repairableEvents = await db
    .select({
      event: biometricEventsTable,
      employeeId: deviceEmployeeMappingsTable.employeeId,
    })
    .from(biometricEventsTable)
    .innerJoin(
      deviceEmployeeMappingsTable,
      and(
        eq(deviceEmployeeMappingsTable.companyId, device.companyId),
        eq(deviceEmployeeMappingsTable.deviceId, device.id),
        eq(deviceEmployeeMappingsTable.deviceEmployeeId, biometricEventsTable.deviceEmployeeId),
        eq(deviceEmployeeMappingsTable.active, true),
      ),
    )
    .where(
      and(
        eq(biometricEventsTable.companyId, device.companyId),
        eq(biometricEventsTable.deviceId, device.id),
        eq(biometricEventsTable.processingStatus, "rejected"),
      ),
    )
    .limit(5000);

  let repaired = 0;
  for (const { event, employeeId } of repairableEvents) {
    try {
      await applyProviderAttendanceEvent(
        context,
        {
          deviceEmployeeId: event.deviceEmployeeId,
          occurredAt: event.occurredAt,
          eventType: event.eventType,
          direction: event.direction,
          idempotencyKey: event.idempotencyKey,
          rawPayload: event.rawPayload ?? {},
        },
        employeeId,
      );
      await db
        .update(biometricEventsTable)
        .set({
          employeeId,
          processingStatus: "mapped",
          processedAt: new Date(),
        })
        .where(eq(biometricEventsTable.id, event.id));
      repaired++;
    } catch {
      await db
        .update(biometricEventsTable)
        .set({
          processingStatus: "failed",
          processedAt: new Date(),
        })
        .where(eq(biometricEventsTable.id, event.id));
    }
  }
  return repaired;
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

async function getrequest(req: Request, res: Response) {
  const device = await deviceFor(req);
  if (device === undefined) { res.status(401).type("text").send("ERROR"); return; }
  if (!device) { res.status(404).type("text").send("ERROR"); return; }

  const now = new Date();
  await db.update(devicesTable).set({
    lastHealthCheck: now,
    connectionState: "connected",
    status: "connected",
    integrationState: "configured",
  }).where(eq(devicesTable.id, device.id));

  const [queuedCommand] = await db
    .select()
    .from(biometricDeviceCommandsTable)
    .where(and(
      eq(biometricDeviceCommandsTable.deviceId, device.id),
      eq(biometricDeviceCommandsTable.status, "queued"),
    ))
    .orderBy(asc(biometricDeviceCommandsTable.createdAt))
    .limit(1);

  if (queuedCommand) {
    const [sentCommand] = await db
      .update(biometricDeviceCommandsTable)
      .set({ status: "sent", sentAt: now })
      .where(and(
        eq(biometricDeviceCommandsTable.id, queuedCommand.id),
        eq(biometricDeviceCommandsTable.status, "queued"),
      ))
      .returning();

    if (sentCommand) {
      if (sentCommand.syncHistoryId) {
        await db.update(biometricSyncHistoryTable)
          .set({
            status: "running",
            message: `ADMS command ${sentCommand.command} sent to the device; waiting for its response and attendance upload.`,
          })
          .where(eq(biometricSyncHistoryTable.id, sentCommand.syncHistoryId));
      }
      await db.insert(biometricSyncHistoryTable).values({
        companyId: device.companyId,
        deviceId: device.id,
        providerKey: "zkteco-adms",
        operation: "heartbeat",
        status: "completed",
        message: "ADMS heartbeat received while delivering a queued command.",
        startedAt: now,
        completedAt: new Date(),
      });
      await audit(device.companyId, "command_sent", device.id, {
        command: sentCommand.command,
        commandNumber: sentCommand.commandNumber,
      });
      res.type("text").send(`C:${sentCommand.commandNumber}:${sentCommand.command}\n`);
      return;
    }
  }

  await db.insert(biometricSyncHistoryTable).values({
    companyId: device.companyId,
    deviceId: device.id,
    providerKey: "zkteco-adms",
    operation: "heartbeat",
    status: "completed",
    message: "ADMS heartbeat received.",
    startedAt: now,
    completedAt: new Date(),
  });
  res.type("text").send("OK");
}

async function devicecmd(req: Request, res: Response) {
  const device = await deviceFor(req);
  if (device === undefined) { res.status(401).type("text").send("ERROR"); return; }
  if (!device) { res.status(404).type("text").send("ERROR"); return; }

  const raw = typeof req.body === "string"
    ? req.body
    : new URLSearchParams(req.body as Record<string, string>).toString();
  const lines = raw.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
  let updated = 0;

  for (const line of lines) {
    const result = new URLSearchParams(line);
    const commandNumber = Number(result.get("ID") || result.get("id"));
    if (!Number.isInteger(commandNumber)) continue;
    const returnCode = result.get("Return") || result.get("return") || "";
    const succeeded = returnCode === "0";
    const completedAt = new Date();
    const [command] = await db
      .select()
      .from(biometricDeviceCommandsTable)
      .where(and(
        eq(biometricDeviceCommandsTable.deviceId, device.id),
        eq(biometricDeviceCommandsTable.commandNumber, commandNumber),
      ))
      .limit(1);
    if (!command) continue;

    await db.update(biometricDeviceCommandsTable)
      .set({
        status: succeeded ? "completed" : "failed",
        result: line,
        completedAt,
      })
      .where(eq(biometricDeviceCommandsTable.id, command.id));

    if (command.syncHistoryId) {
      await db.update(biometricSyncHistoryTable)
        .set({
          status: succeeded ? "completed" : "failed",
          message: succeeded
            ? `The device accepted the ${command.command} command and uploaded its available attendance records.`
            : `The device rejected the ${command.command} command with return code ${returnCode || "unknown"}.`,
          completedAt,
          errorCount: succeeded ? 0 : 1,
        })
        .where(eq(biometricSyncHistoryTable.id, command.syncHistoryId));
    }
    updated++;
  }

  await db.update(devicesTable).set({
    lastHealthCheck: new Date(),
    connectionState: "connected",
    status: updated ? "connected" : "attention",
    integrationState: updated ? "configured" : "syncing",
  }).where(eq(devicesTable.id, device.id));
  await audit(device.companyId, "command_result", device.id, { updated, raw });
  res.type("text").send("OK");
}

router.get("/ping", heartbeat);
router.get("/getrequest", getrequest);
router.post("/devicecmd", devicecmd);
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
  const rejectionReasons: Record<string, number> = {};
  const rejectionSamples: string[] = [];
  const rejectRow = (reason: string, line: string) => {
    rejected++;
    rejectionReasons[reason] = (rejectionReasons[reason] ?? 0) + 1;
    if (rejectionSamples.length < 5) rejectionSamples.push(line.slice(0, 300));
  };
  const now = new Date();
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, device.companyId)).limit(1);
  if (!company) { res.status(404).type("text").send("ERROR"); return; }
  const context = { companyId: device.companyId, company };
  for (const line of rows) {
    const parsed = parseAdmsRow(line);
    if (!parsed) { rejectRow("unsupported_row_format", line); continue; }
    const { pin, timestamp, status, verify, workcode } = parsed;
    let occurredAt: Date;
    try {
      occurredAt = parseDeviceTimestamp(timestamp, company.timezone);
    } catch {
      rejectRow("invalid_timestamp", line);
      continue;
    }
    const statusNumber = Number(status);
    const direction = [0, 4, 5].includes(statusNumber) ? "in" : [1, 2, 3].includes(statusNumber) ? "out" : null;
    if (!pin || !timestamp || !Number.isFinite(statusNumber) || !direction || Number.isNaN(occurredAt.getTime())) {
      rejectRow("invalid_attendance_fields", line);
      continue;
    }
    const idempotencyKey = createHash("sha256").update([device.deviceIdentifier, pin, timestamp, status, verify, workcode].join("|")).digest("hex");
    const [mapping] = await db.select().from(deviceEmployeeMappingsTable).where(and(eq(deviceEmployeeMappingsTable.companyId, device.companyId), eq(deviceEmployeeMappingsTable.deviceId, device.id), eq(deviceEmployeeMappingsTable.deviceEmployeeId, pin), eq(deviceEmployeeMappingsTable.active, true))).limit(1);
    const rawPayload = {
      protocol: "zkteco-adms",
      PIN: pin,
      timestamp,
      status,
      verify,
      workcode,
      ...(mapping
        ? {}
        : {
            rejectionReason:
              "No active employee mapping exists for this device user.",
          }),
    };
    const [event] = await db.insert(biometricEventsTable).values({ companyId: device.companyId, deviceId: device.id, deviceEmployeeId: pin, employeeId: mapping?.employeeId ?? null, occurredAt, eventType: "attendance", direction, idempotencyKey, rawPayload, processingStatus: mapping ? "received" : "rejected" }).onConflictDoNothing({ target: [biometricEventsTable.companyId, biometricEventsTable.idempotencyKey] }).returning();
    if (!event) {
      const [existingEvent] = await db.select().from(biometricEventsTable).where(and(
        eq(biometricEventsTable.companyId, device.companyId),
        eq(biometricEventsTable.idempotencyKey, idempotencyKey),
      )).limit(1);
      const timestampChanged =
        existingEvent &&
        (existingEvent.occurredAt.getTime() !== occurredAt.getTime() ||
          existingEvent.direction !== direction);
      if (!timestampChanged) {
        if (existingEvent && mapping && existingEvent.processingStatus !== "mapped") {
          try {
            await applyProviderAttendanceEvent(
              context,
              {
                deviceEmployeeId: pin,
                occurredAt,
                eventType: "attendance",
                direction,
                idempotencyKey,
                rawPayload,
              },
              mapping.employeeId,
            );
            await db.update(biometricEventsTable).set({
              employeeId: mapping.employeeId,
              rawPayload,
              processingStatus: "mapped",
              processedAt: new Date(),
            }).where(eq(biometricEventsTable.id, existingEvent.id));
            accepted++;
          } catch {
            rejected++;
            await db.update(biometricEventsTable).set({
              processingStatus: "failed",
              processedAt: new Date(),
            }).where(eq(biometricEventsTable.id, existingEvent.id));
          }
          continue;
        }
        if (!event) { duplicates++; continue; }
      }

      await db.update(biometricEventsTable).set({
        occurredAt,
        direction,
        rawPayload,
        processingStatus: mapping ? "received" : "rejected",
        processedAt: null,
      }).where(and(
        eq(biometricEventsTable.companyId, device.companyId),
        eq(biometricEventsTable.idempotencyKey, idempotencyKey),
      ));
      if (!mapping) { rejected++; continue; }
      try {
        await applyProviderAttendanceEvent(context, { deviceEmployeeId: pin, occurredAt, eventType: "attendance", direction, idempotencyKey, rawPayload: {} }, mapping.employeeId);
        await db.update(biometricEventsTable).set({ employeeId: mapping.employeeId, rawPayload, processingStatus: "mapped", processedAt: new Date() }).where(and(
          eq(biometricEventsTable.companyId, device.companyId),
          eq(biometricEventsTable.idempotencyKey, idempotencyKey),
        ));
        accepted++;
      } catch {
        rejected++;
        await db.update(biometricEventsTable).set({ processingStatus: "failed", processedAt: new Date() }).where(and(
          eq(biometricEventsTable.companyId, device.companyId),
          eq(biometricEventsTable.idempotencyKey, idempotencyKey),
        ));
      }
      continue;
    }
    if (!mapping) { rejected++; continue; }
    try {
      await applyProviderAttendanceEvent(context, { deviceEmployeeId: pin, occurredAt, eventType: "attendance", direction, idempotencyKey, rawPayload: {} }, mapping.employeeId);
      await db.update(biometricEventsTable).set({ processingStatus: "mapped", processedAt: new Date() }).where(eq(biometricEventsTable.id, event.id));
      accepted++;
    } catch { rejected++; await db.update(biometricEventsTable).set({ processingStatus: "failed", processedAt: new Date() }).where(eq(biometricEventsTable.id, event.id)); }
  }
  await db.update(devicesTable).set({ lastHealthCheck: now, lastSync: now, connectionState: "connected", status: rejected ? "attention" : "connected", integrationState: "configured" }).where(eq(devicesTable.id, device.id));
  const repaired = await repairRejectedEvents(device, context);
  accepted += repaired;
  rejected = Math.max(0, rejected - repaired);
  await db.insert(biometricSyncHistoryTable).values({ companyId: device.companyId, deviceId: device.id, providerKey: "zkteco-adms", operation: "attendance_sync", status: rejected ? "failed" : "completed", message: `ADMS upload: ${accepted} accepted, ${duplicates} duplicate, ${rejected} rejected.`, eventsReceived: rows.length, eventsProcessed: accepted, errorCount: rejected, startedAt: now, completedAt: new Date() });
  const [recentLogCommand] = await db
    .select()
    .from(biometricDeviceCommandsTable)
    .where(and(
      eq(biometricDeviceCommandsTable.deviceId, device.id),
      eq(biometricDeviceCommandsTable.command, "LOG"),
      eq(biometricDeviceCommandsTable.status, "sent"),
    ))
    .orderBy(asc(biometricDeviceCommandsTable.sentAt))
    .limit(1);
  if (recentLogCommand?.syncHistoryId) {
    await db.update(biometricSyncHistoryTable).set({
      eventsReceived: rows.length,
      eventsProcessed: accepted,
      errorCount: rejected,
      message: `ADMS full-history request uploaded ${accepted} accepted, ${duplicates} duplicate, ${rejected} rejected.`,
    }).where(eq(biometricSyncHistoryTable.id, recentLogCommand.syncHistoryId));
  }
  if (accepted) await audit(device.companyId, "accepted_upload", device.id, { accepted });
  if (rejected) await audit(device.companyId, "rejected_upload", device.id, {
    rejected,
    reasons: rejectionReasons,
    samples: rejectionSamples,
  });
  if (duplicates) await audit(device.companyId, "duplicate_upload", device.id, { duplicates });
  // ADMS retries the entire batch when the endpoint responds with ERROR. Valid
  // rows are already persisted above, and rejected rows are retained for repair,
  // so acknowledge the transport after recording the internal failure.
  res.type("text").send("OK");
});

export default router;
