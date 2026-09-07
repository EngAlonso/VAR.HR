import { drizzle } from "drizzle-orm/neon-http";
import { neon, Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(databaseUrl);
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: sql, schema });

export * from "./schema";
