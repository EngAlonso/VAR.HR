import { defineConfig } from "drizzle-kit";
import path from "path";
import { getDatabaseCredentials } from "./src/connection";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: getDatabaseCredentials(),
});
