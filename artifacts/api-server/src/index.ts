// @ts-nocheck
import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
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

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

export default app;

if (process.env.VERCEL !== "1") {
  void start();
}
