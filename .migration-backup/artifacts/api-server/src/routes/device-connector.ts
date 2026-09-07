import { createHash, timingSafeEqual } from "node:crypto";
import { Router, type Request } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  auditLogsTable,
  biometricEventsTable,
  biometricSyncHistoryTable,
  companiesTable,
  db,
  deviceEmployeeMappingsTable,
  devicesTable,
} from "@workspace/db";
import { applyProviderAttendanceEvent } from "./var-hr";

const router = Router();

const connectorEventSchema = z.object({
  deviceEmployeeId: z.string().trim().min(1).max(120),
  occurredAt: z.string().datetime({ offset: true }),
  direction: z.enum(["in", "out"]),
  idempotencyKey: z.string().trim().min(1).max(256),
  rawPayload: z.record(z.string(), z.unknown()).optional(),
});

const connectorPayloadSchema = z.object({
  events: z.array(connectorEventSchema).min(1).max(500),
});

function suppliedRegistrationKey(req: Request): string | undefined {
  const authorization = req.header("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer || req.header("x-var-hr-registration-key") || undefined;
}

function keyMatches(stored: string | null, supplied: string | undefined) {
  if (!stored || !supplied) return false;
  const expected = Buffer.from(stored, "utf8");
  const actual = Buffer.from(
    createHash("sha256").update(supplied).digest("hex"),
    "utf8",
  );
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

router.post(
  "/connector/v1/devices/:deviceId/events",
  async (req, res): Promise<void> => {
    const parsedDeviceId = z.string().uuid().safeParse(req.params.deviceId);
    const parsedBody = connectorPayloadSchema.safeParse(req.body);
    if (!parsedDeviceId.success || !parsedBody.success) {
      res.status(400).json({ error: "Invalid connector request." });
      return;
    }

    const [row] = await db
      .select({ device: devicesTable, company: companiesTable })
      .from(devicesTable)
      .innerJoin(companiesTable, eq(devicesTable.companyId, companiesTable.id))
      .where(eq(devicesTable.id, parsedDeviceId.data))
      .limit(1);
    if (!row || row.device.adapterKey !== "zkteco-usb") {
      res.status(404).json({ error: "USB connector device not found." });
      return;
    }
    if (!keyMatches(row.device.registrationKeyHash, suppliedRegistrationKey(req))) {
      res.status(401).json({ error: "A valid device registration key is required." });
      return;
    }

    const startedAt = new Date();
    let accepted = 0;
    let duplicates = 0;
    let rejected = 0;
    for (const event of parsedBody.data.events) {
      const occurredAt = new Date(event.occurredAt);
      const [mapping] = await db
        .select({ employeeId: deviceEmployeeMappingsTable.employeeId })
        .from(deviceEmployeeMappingsTable)
        .where(
          and(
            eq(deviceEmployeeMappingsTable.companyId, row.device.companyId),
            eq(deviceEmployeeMappingsTable.deviceId, row.device.id),
            eq(
              deviceEmployeeMappingsTable.deviceEmployeeId,
              event.deviceEmployeeId,
            ),
            eq(deviceEmployeeMappingsTable.active, true),
          ),
        )
        .limit(1);
      const [stored] = await db
        .insert(biometricEventsTable)
        .values({
          companyId: row.device.companyId,
          deviceId: row.device.id,
          deviceEmployeeId: event.deviceEmployeeId,
          employeeId: mapping?.employeeId ?? null,
          occurredAt,
          eventType: "attendance",
          direction: event.direction,
          idempotencyKey: event.idempotencyKey,
          rawPayload: event.rawPayload ?? { protocol: "zkteco-usb" },
          processingStatus: mapping ? "received" : "pending_adapter",
        })
        .onConflictDoNothing({
          target: [
            biometricEventsTable.companyId,
            biometricEventsTable.idempotencyKey,
          ],
        })
        .returning();
      if (!stored) {
        duplicates += 1;
        continue;
      }
      if (!mapping) {
        rejected += 1;
        continue;
      }
      try {
        await applyProviderAttendanceEvent(
          { companyId: row.device.companyId, company: row.company },
          {
            deviceEmployeeId: event.deviceEmployeeId,
            occurredAt,
            eventType: "attendance",
            direction: event.direction,
            idempotencyKey: event.idempotencyKey,
            rawPayload: event.rawPayload ?? {},
          },
          mapping.employeeId,
        );
        await db
          .update(biometricEventsTable)
          .set({ processingStatus: "mapped", processedAt: new Date() })
          .where(eq(biometricEventsTable.id, stored.id));
        accepted += 1;
      } catch {
        rejected += 1;
        await db
          .update(biometricEventsTable)
          .set({ processingStatus: "failed", processedAt: new Date() })
          .where(eq(biometricEventsTable.id, stored.id));
      }
    }

    const completedAt = new Date();
    await db
      .update(devicesTable)
      .set({
        lastHealthCheck: completedAt,
        lastSync: completedAt,
        connectionState: "connected",
        status: rejected ? "attention" : "connected",
        integrationState: "configured",
      })
      .where(eq(devicesTable.id, row.device.id));
    await db.insert(biometricSyncHistoryTable).values({
      companyId: row.device.companyId,
      deviceId: row.device.id,
      providerKey: "zkteco-usb",
      operation: "attendance_sync",
      status: rejected ? "failed" : "completed",
      message: `USB connector upload: ${accepted} accepted, ${duplicates} duplicate, ${rejected} rejected.`,
      eventsReceived: parsedBody.data.events.length,
      eventsProcessed: accepted,
      errorCount: rejected,
      startedAt,
      completedAt,
    });
    await db.insert(auditLogsTable).values({
      companyId: row.device.companyId,
      actorType: "system",
      actorId: "usb-connector",
      action: "usb_connector_upload",
      entityType: "device",
      entityId: row.device.id,
      before: null,
      after: { accepted, duplicates, rejected },
    });

    res.status(201).json({
      accepted,
      duplicates,
      rejected,
      received: parsedBody.data.events.length,
    });
  },
);

export default router;