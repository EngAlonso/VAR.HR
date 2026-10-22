export type DatabaseCredentials =
  | { url: string }
  | {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
      ssl: {
        ca: string;
        rejectUnauthorized: true;
      };
    };

function parsePostgresUrl(databaseUrl: string, variableName: string): URL {
  const parsed = new URL(databaseUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error(`${variableName} must use the PostgreSQL protocol.`);
  }
  return parsed;
}

function getVerifiedAivenCredentials(databaseUrl: string): DatabaseCredentials {
  const parsed = parsePostgresUrl(databaseUrl, "Aiven database URL");
  const rawCa = process.env.AIVEN_CA_CERT;
  if (!rawCa?.includes("-----BEGIN CERTIFICATE-----")) {
    throw new Error(
      "AIVEN_CA_CERT must contain Aiven's CA certificate; TLS certificate verification stays enabled.",
    );
  }
  const ca = rawCa
    .replace(/\\n/g, "\n")
    .trim()
    .replace(
      /-----BEGIN CERTIFICATE-----\s*/g,
      "-----BEGIN CERTIFICATE-----\n",
    )
    .replace(/\s*-----END CERTIFICATE-----/g, "\n-----END CERTIFICATE-----\n");

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.replace(/^\/+/, "")),
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  };
}

export function getDatabaseCredentials(): DatabaseCredentials {
  const externalUrl = process.env.EXTERNAL_DATABASE_URL;
  const databaseUrl = externalUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Set EXTERNAL_DATABASE_URL or provision a database with DATABASE_URL.",
    );
  }

  const parsed = parsePostgresUrl(databaseUrl, "Database URL");

  const usesAiven =
    externalUrl !== undefined || parsed.hostname.endsWith(".aivencloud.com");
  return usesAiven ? getVerifiedAivenCredentials(databaseUrl) : { url: databaseUrl };
}

export function getDevelopmentDatabaseCredentials(): DatabaseCredentials {
  if (process.env.VERCEL === "1" || process.env.EXTERNAL_DATABASE_URL) {
    throw new Error(
      "Development migrations require Replit's DATABASE_URL and must not use an external production URL.",
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required for development migrations.",
    );
  }

  const parsed = parsePostgresUrl(databaseUrl, "DATABASE_URL");
  if (parsed.hostname.endsWith(".aivencloud.com")) {
    throw new Error(
      "DATABASE_URL points to Aiven. Development migration commands are blocked from production.",
    );
  }
  return { url: databaseUrl };
}

export function getAivenMigrationCredentials(): DatabaseCredentials {
  if (process.env.VERCEL === "1") {
    throw new Error(
      "Aiven migrations must run as an explicit operation, never in a Vercel build or runtime.",
    );
  }
  const databaseUrl = process.env.AIVEN_MIGRATION_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("AIVEN_MIGRATION_DATABASE_URL is required for Aiven migrations.");
  }
  const parsed = parsePostgresUrl(
    databaseUrl,
    "AIVEN_MIGRATION_DATABASE_URL",
  );
  if (!parsed.hostname.endsWith(".aivencloud.com")) {
    throw new Error(
      "AIVEN_MIGRATION_DATABASE_URL must point to the confirmed Aiven host.",
    );
  }
  return getVerifiedAivenCredentials(databaseUrl);
}
