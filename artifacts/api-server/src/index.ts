import app from "./app";
import { logger } from "./lib/logger";
import { initializeDemoData } from "./lib/seed";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

async function start(): Promise<void> {
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

  await initializeDemoData();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start();
