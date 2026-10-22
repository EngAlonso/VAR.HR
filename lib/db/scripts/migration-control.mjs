import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const dbDirectory = path.resolve(scriptDirectory, "..");
const migrationsDirectory = path.join(dbDirectory, "migrations");
const aivenReportPath = path.join(
  migrationsDirectory,
  "meta",
  "aiven-baseline-report.json",
);
const migrationLockKey = [741281, 10101];
const developmentBootstrapMigrationTag = "0009_mixed_stepford_cuckoos";

function normalizeCaCertificate(value) {
  if (!value?.includes("-----BEGIN CERTIFICATE-----")) {
    throw new Error(
      "AIVEN_CA_CERT must contain the Aiven CA certificate. TLS verification remains enabled.",
    );
  }
  return value
    .replace(/\\n/g, "\n")
    .trim()
    .replace(
      /-----BEGIN CERTIFICATE-----\s*/g,
      "-----BEGIN CERTIFICATE-----\n",
    )
    .replace(/\s*-----END CERTIFICATE-----/g, "\n-----END CERTIFICATE-----\n");
}

function parsePostgresUrl(value, name) {
  if (!value) throw new Error(`${name} is required.`);
  const url = new URL(value);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(`${name} must use the PostgreSQL protocol.`);
  }
  return url;
}

function getAivenPool() {
  if (process.env.VERCEL === "1") {
    throw new Error(
      "Aiven migration operations cannot run in a Vercel build or application runtime.",
    );
  }
  const url = parsePostgresUrl(
    process.env.AIVEN_MIGRATION_DATABASE_URL,
    "AIVEN_MIGRATION_DATABASE_URL",
  );
  if (!url.hostname.endsWith(".aivencloud.com")) {
    throw new Error(
      "AIVEN_MIGRATION_DATABASE_URL must point to the confirmed Aiven host.",
    );
  }

  return new Pool({
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\/+/, "")),
    ssl: {
      ca: normalizeCaCertificate(process.env.AIVEN_CA_CERT),
      rejectUnauthorized: true,
    },
    max: 2,
    application_name: "var-hr-migration-control",
  });
}

function getDevelopmentPool() {
  if (
    process.env.VERCEL === "1" ||
    process.env.EXTERNAL_DATABASE_URL
  ) {
    throw new Error(
      "Development migration operations accept only Replit's DATABASE_URL. Remove EXTERNAL_DATABASE_URL from this environment.",
    );
  }
  const url = parsePostgresUrl(process.env.DATABASE_URL, "DATABASE_URL");
  if (url.hostname.endsWith(".aivencloud.com")) {
    throw new Error(
      "DATABASE_URL points to Aiven. Development migration operations are blocked from production.",
    );
  }
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
}

async function getLatestMigration() {
  const journal = JSON.parse(
    await readFile(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8",
    ),
  );
  const entry = journal.entries.at(-1);
  if (!entry) throw new Error("The Drizzle migration journal is empty.");
  const sql = await readFile(
    path.join(migrationsDirectory, `${entry.tag}.sql`),
    "utf8",
  );
  return {
    entry,
    hash: createHash("sha256").update(sql).digest("hex"),
  };
}

async function getJournalMigrations() {
  const journal = JSON.parse(
    await readFile(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8",
    ),
  );
  return Promise.all(
    journal.entries.map(async (entry) => ({
      entry,
      hash: createHash("sha256")
        .update(
          await readFile(
            path.join(migrationsDirectory, `${entry.tag}.sql`),
            "utf8",
          ),
        )
        .digest("hex"),
    })),
  );
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprint(report) {
  const schemaState = {
    columns: report.columns,
    indexes: report.indexes,
    constraints: report.constraints,
    migrationLedger: report.migrationLedger,
  };
  return createHash("sha256").update(stableJson(schemaState)).digest("hex");
}

async function captureDatabaseState(pool) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    const identityResult = await client.query(
      "SELECT current_database() AS database_name, current_setting('server_version') AS server_version",
    );
    const columnsResult = await client.query(`
      SELECT
        c.relname AS table_name,
        a.attname AS column_name,
        format_type(a.atttypid, a.atttypmod) AS data_type,
        a.attnotnull AS not_null,
        pg_get_expr(default_row.adbin, default_row.adrelid) AS default_value
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attribute a ON a.attrelid = c.oid
      LEFT JOIN pg_attrdef default_row
        ON default_row.adrelid = c.oid AND default_row.adnum = a.attnum
      WHERE n.nspname = 'public'
        AND c.relkind IN ('r', 'p')
        AND c.relname LIKE 'var_hr_%'
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY c.relname, a.attnum
    `);
    const indexesResult = await client.query(`
      SELECT tablename AS table_name, indexname AS index_name, indexdef AS definition
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename LIKE 'var_hr_%'
      ORDER BY tablename, indexname
    `);
    const constraintsResult = await client.query(`
      SELECT
        table_class.relname AS table_name,
        constraint_row.conname AS constraint_name,
        constraint_row.contype AS constraint_type,
        pg_get_constraintdef(constraint_row.oid, true) AS definition
      FROM pg_constraint constraint_row
      JOIN pg_class table_class ON table_class.oid = constraint_row.conrelid
      JOIN pg_namespace table_schema ON table_schema.oid = table_class.relnamespace
      WHERE table_schema.nspname = 'public'
        AND table_class.relname LIKE 'var_hr_%'
      ORDER BY table_class.relname, constraint_row.conname
    `);
    const ledgerExistsResult = await client.query(
      "SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS exists",
    );
    const ledgerExists = ledgerExistsResult.rows[0].exists;
    let ledgerEntries = [];
    if (ledgerExists) {
      const ledgerResult = await client.query(`
        SELECT hash, created_at::text AS created_at
        FROM drizzle.__drizzle_migrations
        ORDER BY created_at, id
      `);
      ledgerEntries = ledgerResult.rows;
    }
    await client.query("COMMIT");

    const report = {
      databaseName: identityResult.rows[0].database_name,
      serverVersion: identityResult.rows[0].server_version,
      columns: columnsResult.rows,
      indexes: indexesResult.rows,
      constraints: constraintsResult.rows,
      migrationLedger: {
        exists: ledgerExists,
        entries: ledgerEntries,
      },
    };
    return { ...report, fingerprint: fingerprint(report) };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function getPublicApplicationTables(pool) {
  const result = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    ORDER BY tablename
  `);
  return result.rows.map((row) => row.tablename);
}

function normalizeType(type) {
  return String(type)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/^serial$/, "integer")
    .replace(/^bigserial$/, "bigint")
    .replace(/^varchar(?=\(|$)/, "character varying")
    .replace(/^char(?=\(|$)/, "character");
}

async function compareColumnsToSnapshot(state, migrationEntry) {
  const snapshotIndex = String(migrationEntry.idx).padStart(4, "0");
  const snapshot = JSON.parse(
    await readFile(
      path.join(migrationsDirectory, "meta", `${snapshotIndex}_snapshot.json`),
      "utf8",
    ),
  );
  const expectedColumns = [];
  for (const table of Object.values(snapshot.tables)) {
    for (const column of Object.values(table.columns)) {
      expectedColumns.push({
        table_name: table.name,
        column_name: column.name,
        data_type: normalizeType(column.type),
        not_null: Boolean(column.notNull),
        requiresSequence: column.type === "serial" || column.type === "bigserial",
      });
    }
  }

  const key = ({ table_name, column_name }) => `${table_name}.${column_name}`;
  const actualByKey = new Map(state.columns.map((column) => [key(column), column]));
  const expectedByKey = new Map(
    expectedColumns.map((column) => [key(column), column]),
  );
  const missing = [];
  const unexpected = [];
  const mismatched = [];

  for (const [columnKey, expected] of expectedByKey) {
    const actual = actualByKey.get(columnKey);
    if (!actual) {
      missing.push(columnKey);
      continue;
    }
    if (
      normalizeType(actual.data_type) !== expected.data_type ||
      actual.not_null !== expected.not_null ||
      (expected.requiresSequence &&
        !String(actual.default_value ?? "").startsWith("nextval("))
    ) {
      mismatched.push({
        column: columnKey,
        expectedType: expected.data_type,
        actualType: normalizeType(actual.data_type),
        expectedNotNull: expected.not_null,
        actualNotNull: actual.not_null,
        expectedSerialSequence: expected.requiresSequence,
        actualDefault: actual.default_value,
      });
    }
  }
  for (const columnKey of actualByKey.keys()) {
    if (!expectedByKey.has(columnKey)) unexpected.push(columnKey);
  }

  return {
    matches: missing.length === 0 && unexpected.length === 0 && mismatched.length === 0,
    expectedTableCount: new Set(expectedColumns.map((column) => column.table_name))
      .size,
    actualTableCount: new Set(state.columns.map((column) => column.table_name))
      .size,
    expectedColumnCount: expectedColumns.length,
    actualColumnCount: state.columns.length,
    missing,
    unexpected,
    mismatched,
  };
}

async function compareColumnsToLatestSnapshot(state) {
  const latestMigration = await getLatestMigration();
  return compareColumnsToSnapshot(state, latestMigration.entry);
}

async function findMatchingSnapshot(state) {
  const journal = JSON.parse(
    await readFile(
      path.join(migrationsDirectory, "meta", "_journal.json"),
      "utf8",
    ),
  );
  let latestAvailableComparison = null;

  for (const entry of [...journal.entries].reverse()) {
    const snapshotPath = path.join(
      migrationsDirectory,
      "meta",
      `${String(entry.idx).padStart(4, "0")}_snapshot.json`,
    );
    let snapshot;
    try {
      snapshot = await readFile(snapshotPath, "utf8");
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    if (!snapshot) continue;

    const comparison = await compareColumnsToSnapshot(state, entry);
    if (!latestAvailableComparison) {
      latestAvailableComparison = { entry, comparison };
    }
    if (comparison.matches) {
      const sql = await readFile(
        path.join(migrationsDirectory, `${entry.tag}.sql`),
        "utf8",
      );
      return {
        migration: {
          entry,
          hash: createHash("sha256").update(sql).digest("hex"),
        },
        comparison,
        latestAvailableComparison,
      };
    }
  }

  return {
    migration: null,
    comparison: latestAvailableComparison?.comparison ?? null,
    latestAvailableComparison,
  };
}

function migrationLedgerSummary(state) {
  return {
    exists: state.migrationLedger.exists,
    entries: state.migrationLedger.entries.length,
    latest: state.migrationLedger.entries.at(-1) ?? null,
  };
}

async function inspectAiven() {
  const pool = getAivenPool();
  try {
    const state = await captureDatabaseState(pool);
    const match = await findMatchingSnapshot(state);
    const latest = await getLatestMigration();
    let previousReport = null;
    try {
      previousReport = JSON.parse(await readFile(aivenReportPath, "utf8"));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    const baselineIsCurrent =
      previousReport?.status === "baselined" &&
      previousReport.databaseName === state.databaseName &&
      previousReport.currentSchemaFingerprint === state.fingerprint &&
      state.migrationLedger.exists &&
      state.migrationLedger.entries.some(
        (entry) => entry.hash === previousReport.baselineMigration?.hash,
      );
    const report = {
      reportVersion: 1,
      target: "Aiven production",
      status: baselineIsCurrent ? "baselined" : "inspected",
      inspectedAt: new Date().toISOString(),
      databaseName: state.databaseName,
      serverVersion: state.serverVersion,
      currentSchemaFingerprint: state.fingerprint,
      ...(baselineIsCurrent
        ? {
            baselinedAt: previousReport.baselinedAt,
            baselineMigration: previousReport.baselineMigration,
            lastMigrationRunAt: previousReport.lastMigrationRunAt,
            lastAppliedMigration: previousReport.lastAppliedMigration,
          }
        : {}),
      columnsMatchKnownSnapshot: Boolean(match.migration),
      matchingSnapshotMigration: match.migration
        ? {
            tag: match.migration.entry.tag,
            createdAt: match.migration.entry.when,
            hash: match.migration.hash,
          }
        : null,
      comparison: match.comparison,
      latestSnapshotComparison: match.latestAvailableComparison
        ? {
            tag: match.latestAvailableComparison.entry.tag,
            comparison: match.latestAvailableComparison.comparison,
          }
        : null,
      latestRepositoryMigration: {
        tag: latest.entry.tag,
        createdAt: latest.entry.when,
        hash: latest.hash,
      },
      migrationLedger: state.migrationLedger,
      columns: state.columns,
      indexes: state.indexes,
      constraints: state.constraints,
    };
    await writeFile(aivenReportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(
      JSON.stringify(
        {
          reportPath: path.relative(process.cwd(), aivenReportPath),
          databaseName: report.databaseName,
          serverVersion: report.serverVersion,
          schemaFingerprint: report.currentSchemaFingerprint,
          columnsMatchKnownSnapshot: report.columnsMatchKnownSnapshot,
          matchingSnapshotMigration: report.matchingSnapshotMigration,
          comparison: report.comparison,
          migrationLedger: migrationLedgerSummary(state),
        },
        null,
        2,
      ),
    );
    if (!match.migration) {
      process.exitCode = 2;
      console.error(
        "Aiven schema does not match any available Drizzle snapshot. Do not baseline or migrate it until the differences are reviewed.",
      );
    }
  } finally {
    await pool.end();
  }
}

async function inspectDev() {
  const pool = getDevelopmentPool();
  try {
    const state = await captureDatabaseState(pool);
    const comparison = await compareColumnsToLatestSnapshot(state);
    console.log(
      JSON.stringify(
        {
          target: "Replit development",
          databaseName: state.databaseName,
          serverVersion: state.serverVersion,
          schemaFingerprint: state.fingerprint,
          columnsMatchLatestSnapshot: comparison.matches,
          comparison,
          migrationLedger: migrationLedgerSummary(state),
        },
        null,
        2,
      ),
    );
    if (!comparison.matches) {
      process.exitCode = 2;
      console.error(
        "Development schema differs from the latest Drizzle snapshot. Do not baseline until the differences are reviewed.",
      );
    }
  } finally {
    await pool.end();
  }
}

function requireFlag(flag) {
  if (!process.argv.includes(flag)) {
    throw new Error(`This operation requires the explicit ${flag} flag.`);
  }
}

async function writeBaseline(pool, target) {
  const stateBefore = await captureDatabaseState(pool);
  if (
    stateBefore.migrationLedger.entries.length > 0 ||
    (target === "Aiven production" && stateBefore.migrationLedger.exists)
  ) {
    throw new Error(
      `Refusing to baseline ${target}: drizzle.__drizzle_migrations already contains migration history. Never overwrite or replace an existing migration ledger.`,
    );
  }

  let baselineMigration;
  let aivenReport;
  if (target === "Aiven production") {
    try {
      aivenReport = JSON.parse(await readFile(aivenReportPath, "utf8"));
    } catch {
      throw new Error(
        "Run inspect:aiven first. The baseline operation requires a saved read-only inspection report.",
      );
    }
    const match = await findMatchingSnapshot(stateBefore);
    if (
      !match.migration ||
      aivenReport.status !== "inspected" ||
      aivenReport.databaseName !== stateBefore.databaseName ||
      aivenReport.currentSchemaFingerprint !== stateBefore.fingerprint ||
      aivenReport.matchingSnapshotMigration?.tag !== match.migration?.entry.tag ||
      aivenReport.matchingSnapshotMigration?.createdAt !==
        match.migration?.entry.when ||
      aivenReport.matchingSnapshotMigration?.hash !== match.migration?.hash ||
      aivenReport.migrationLedger?.exists
    ) {
      throw new Error(
        "The saved Aiven inspection is missing, stale, mismatched, or already has a migration ledger. Re-inspect and review the target before baselining.",
      );
    }
    baselineMigration = match.migration;
  } else {
    const match = await findMatchingSnapshot(stateBefore);
    if (!match.migration) {
      throw new Error(
        `Refusing to baseline ${target}: columns/types/nullability do not match any available Drizzle snapshot. Review the schema before proceeding.`,
      );
    }
    baselineMigration = match.migration;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", migrationLockKey);
    const ledgerExists = await client.query(
      "SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS exists",
    );
    if (ledgerExists.rows[0].exists) {
      const ledgerCount = await client.query(
        "SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations",
      );
      if (Number(ledgerCount.rows[0].count) > 0) {
        throw new Error(
          "Migration history appeared during baseline; no changes were made.",
        );
      }
    } else {
      await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
      await client.query(`
        CREATE TABLE drizzle.__drizzle_migrations (
          id serial PRIMARY KEY,
          hash text NOT NULL,
          created_at bigint
        )
      `);
    }
    await client.query(
      "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
      [baselineMigration.hash, String(baselineMigration.entry.when)],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const stateAfter = await captureDatabaseState(pool);
  if (target === "Aiven production") {
    const savedReport = JSON.parse(await readFile(aivenReportPath, "utf8"));
    savedReport.status = "baselined";
    savedReport.baselinedAt = new Date().toISOString();
    savedReport.currentSchemaFingerprint = stateAfter.fingerprint;
    savedReport.migrationLedger = stateAfter.migrationLedger;
    savedReport.baselineMigration = {
      tag: baselineMigration.entry.tag,
      createdAt: baselineMigration.entry.when,
      hash: baselineMigration.hash,
    };
    await writeFile(aivenReportPath, `${JSON.stringify(savedReport, null, 2)}\n`);
  }
  console.log(
    JSON.stringify(
      {
        target,
        databaseName: stateAfter.databaseName,
        baselineMigration: baselineMigration.entry.tag,
        migrationHash: baselineMigration.hash,
        migrationLedger: migrationLedgerSummary(stateAfter),
        schemaFingerprint: stateAfter.fingerprint,
      },
      null,
      2,
    ),
  );
}

async function baselineDev() {
  requireFlag("--confirm-dev-baseline");
  const pool = getDevelopmentPool();
  try {
    await writeBaseline(pool, "Replit development");
  } finally {
    await pool.end();
  }
}

async function baselineAiven() {
  requireFlag("--confirm-aiven-baseline");
  const pool = getAivenPool();
  try {
    await writeBaseline(pool, "Aiven production");
  } finally {
    await pool.end();
  }
}

async function migrateDev() {
  const pool = getDevelopmentPool();
  try {
    const state = await captureDatabaseState(pool);
    const hasApplicationSchema = state.columns.length > 0;
    const hasMigrationHistory = state.migrationLedger.entries.length > 0;
    const publicTables = await getPublicApplicationTables(pool);

    if (!hasApplicationSchema && hasMigrationHistory) {
      throw new Error(
        "Development has migration history but no application tables. Inspect and reconcile it before migrating.",
      );
    }

    if (!hasApplicationSchema) {
      if (publicTables.length > 0) {
        throw new Error(
          `Automatic development bootstrap requires an empty public schema. Existing public table(s): ${publicTables.join(", ")}.`,
        );
      }
      console.log(
        "Empty development database detected. Bootstrapping the checked-in 0009 schema before applying pending migrations.",
      );
      const bootstrapResult = spawnSync(
        "pnpm",
        [
          "exec",
          "drizzle-kit",
          "push",
          "--config",
          "./drizzle.bootstrap.config.ts",
        ],
        {
          cwd: dbDirectory,
          env: process.env,
          stdio: "inherit",
        },
      );
      if (bootstrapResult.error) throw bootstrapResult.error;
      if (bootstrapResult.status !== 0) {
        throw new Error(
          `Development schema bootstrap exited with status ${bootstrapResult.status ?? "unknown"}.`,
        );
      }

      const bootstrappedState = await captureDatabaseState(pool);
      const match = await findMatchingSnapshot(bootstrappedState);
      if (
        !match.migration ||
        match.migration.entry.tag !== developmentBootstrapMigrationTag
      ) {
        throw new Error(
          `The empty development database did not match the required ${developmentBootstrapMigrationTag} baseline. No migration history was recorded.`,
        );
      }
      await writeBaseline(pool, "Replit development");
    } else if (!hasMigrationHistory) {
      throw new Error(
        "Development already has application tables but no migration history. Run inspect:dev, review the schema, then baseline:dev explicitly; automatic bootstrap is limited to an empty database.",
      );
    }
  } finally {
    await pool.end();
  }

  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "drizzle-kit",
      "migrate",
      "--config",
      "./drizzle.config.ts",
    ],
    {
      cwd: dbDirectory,
      env: process.env,
      stdio: "inherit",
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Development migration process exited with status ${result.status ?? "unknown"}.`,
    );
  }
}

async function migrateAiven() {
  requireFlag("--confirm-aiven-production");
  const aivenPool = getAivenPool();
  const devPool = getDevelopmentPool();
  try {
    let savedReport;
    try {
      savedReport = JSON.parse(await readFile(aivenReportPath, "utf8"));
    } catch {
      throw new Error(
        "Aiven has no saved baseline report. Inspect and baseline the target before applying production migrations.",
      );
    }
    if (savedReport.status !== "baselined") {
      throw new Error(
        "Aiven migrations are blocked until the inspected schema has been baselined.",
      );
    }

    const [aivenState, devState, migrations] = await Promise.all([
      captureDatabaseState(aivenPool),
      captureDatabaseState(devPool),
      getJournalMigrations(),
    ]);
    if (aivenState.databaseName !== savedReport.databaseName) {
      throw new Error(
        "AIVEN_MIGRATION_DATABASE_URL now points to a different database than the reviewed baseline.",
      );
    }
    if (aivenState.fingerprint !== savedReport.currentSchemaFingerprint) {
      throw new Error(
        "Aiven's schema or migration ledger changed after its last recorded migration. Re-inspect and review before continuing.",
      );
    }
    if (!aivenState.migrationLedger.exists || !devState.migrationLedger.exists) {
      throw new Error(
        "Both Aiven and development must have a verified Drizzle baseline before production migrations can run.",
      );
    }

    const aivenLast = aivenState.migrationLedger.entries.at(-1);
    const devHashes = new Set(
      devState.migrationLedger.entries.map((entry) => entry.hash),
    );
    const pending = migrations.filter(
      ({ entry }) => Number(entry.when) > Number(aivenLast?.created_at ?? 0),
    );
    const untested = pending.filter(({ hash }) => !devHashes.has(hash));
    if (untested.length) {
      throw new Error(
        `Production is blocked: these migration(s) have not been applied to the development database: ${untested
          .map(({ entry }) => entry.tag)
          .join(", ")}`,
      );
    }
    if (!pending.length) {
      console.log("Aiven is already up to date; no DDL was run.");
      return;
    }

    console.log(
      `Applying reviewed, development-tested migration(s) to Aiven: ${pending
        .map(({ entry }) => entry.tag)
        .join(", ")}`,
    );
    const result = spawnSync(
      "pnpm",
      [
        "exec",
        "drizzle-kit",
        "migrate",
        "--config",
        "./drizzle.aiven.config.ts",
      ],
      {
        cwd: dbDirectory,
        env: process.env,
        stdio: "inherit",
      },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Drizzle migration process exited with status ${result.status ?? "unknown"}.`,
      );
    }

    const stateAfter = await captureDatabaseState(aivenPool);
    const appliedHashes = new Set(
      stateAfter.migrationLedger.entries.map((entry) => entry.hash),
    );
    const unapplied = pending.filter(({ hash }) => !appliedHashes.has(hash));
    if (unapplied.length) {
      throw new Error(
        `The migration command ended, but the ledger is missing: ${unapplied
          .map(({ entry }) => entry.tag)
          .join(", ")}`,
      );
    }
    savedReport.status = "baselined";
    savedReport.lastMigrationRunAt = new Date().toISOString();
    savedReport.currentSchemaFingerprint = stateAfter.fingerprint;
    savedReport.migrationLedger = stateAfter.migrationLedger;
    savedReport.lastAppliedMigration = stateAfter.migrationLedger.entries.at(-1);
    await writeFile(aivenReportPath, `${JSON.stringify(savedReport, null, 2)}\n`);
    console.log(
      `Aiven migration ledger is current through ${stateAfter.migrationLedger.entries.at(-1)?.created_at}.`,
    );
  } finally {
    await Promise.all([aivenPool.end(), devPool.end()]);
  }
}

const command = process.argv[2];
try {
  if (command === "inspect:dev") await inspectDev();
  else if (command === "inspect:aiven") await inspectAiven();
  else if (command === "baseline:dev") await baselineDev();
  else if (command === "baseline:aiven") await baselineAiven();
  else if (command === "migrate:dev") await migrateDev();
  else if (command === "migrate:aiven") await migrateAiven();
  else {
    throw new Error(
      "Usage: migration-control.mjs migrate:dev | inspect:dev | inspect:aiven | baseline:dev | baseline:aiven | migrate:aiven",
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Migration operation failed.");
  process.exitCode = 1;
}
