import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as PgPool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use the PostgreSQL wire protocol for every deployment, including Neon.
// The application relies on transactions and PostgreSQL advisory locks for
// atomic provisioning and other multi-step HR operations. The Neon HTTP
// driver does not support Drizzle transactions, so using it here causes
// otherwise valid requests to fail at runtime on Vercel.
export const pool = new PgPool({ connectionString: databaseUrl });
export const db = drizzlePg(pool, { schema });

export * from "./schema";
