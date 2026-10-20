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

export function getDatabaseCredentials(): DatabaseCredentials {
  const externalUrl = process.env.EXTERNAL_DATABASE_URL;
  const databaseUrl = externalUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Set EXTERNAL_DATABASE_URL or provision a database with DATABASE_URL.",
    );
  }

  if (!externalUrl) {
    return { url: databaseUrl };
  }

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

  const parsed = new URL(externalUrl);
  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("EXTERNAL_DATABASE_URL must use the PostgreSQL protocol.");
  }

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
