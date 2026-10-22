import { defineConfig } from "drizzle-kit";
import path from "path";
import { getDevelopmentDatabaseCredentials } from "./src/connection";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: "./migrations",
  dialect: "postgresql",
  migrations: {
    schema: "drizzle",
    table: "__drizzle_migrations",
  },
  dbCredentials: getDevelopmentDatabaseCredentials(),
});
