import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { neon, Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseHost = new URL(databaseUrl).hostname;
const isNeonDatabase = databaseHost.endsWith(".neon.tech");

// Neon HTTP is ideal for Neon-hosted serverless deployments, but it cannot
// execute against Replit's managed PostgreSQL endpoint. Use node-postgres for
// any non-Neon PostgreSQL connection string.
const neonPool = isNeonDatabase
  ? new NeonPool({ connectionString: databaseUrl })
  : null;
const pgPool = isNeonDatabase
  ? null
  : new PgPool({ connectionString: databaseUrl });

export const pool = neonPool ?? pgPool;
export const db = isNeonDatabase
  ? drizzleNeon({ client: neon(databaseUrl), schema })
  : drizzlePg(pgPool!, { schema });

export * from "./schema";
