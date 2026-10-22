// @ts-nocheck
import "dotenv/config";
import app from "./app";
import { startAutomaticBackupScheduler } from "./lib/backup-scheduler";
import { logger } from "./lib/logger";

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
