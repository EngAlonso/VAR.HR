// @ts-nocheck
import "dotenv/config";
import app from "./app";
import { startAutomaticBackupScheduler } from "./lib/backup-scheduler";
import { logger } from "./lib/logger";
import { and, eq, isNull } from "drizzle-orm";
import { db, employeesTable } from "@workspace/db";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function start(): Promise<void> {
  const rawPort = process.env["PORT"];
  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  logger.info("Ensuring VAR HR database schema is initialized");
  const { stdout, stderr } = await execFileAsync(
    "pnpm",
    ["--filter", "@workspace/db", "run", "push"],
    {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  if (stdout.trim()) logger.info({ output: stdout.trim() }, "Database schema check complete");
  if (stderr.trim()) logger.warn({ output: stderr.trim() }, "Database schema command reported diagnostics");

  const backfilledEmployees = await db
    .update(employeesTable)
    .set({ workDaysPerMonth: 26, updatedAt: new Date() })
    .where(
      and(
        eq(employeesTable.payBasis, "monthly"),
        isNull(employeesTable.workDaysPerMonth),
      ),
    )
    .returning({ id: employeesTable.id });
  if (backfilledEmployees.length > 0) {
    logger.info(
      { count: backfilledEmployees.length },
      "Backfilled reference workdays for monthly employees",
    );
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
    startAutomaticBackupScheduler();
  });
}

export default app;

if (process.env.VERCEL !== "1") {
  void start();
}
