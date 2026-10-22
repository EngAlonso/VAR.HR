import { defineConfig } from "drizzle-kit";
import path from "path";
import { getDevelopmentDatabaseCredentials } from "./src/connection";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/bootstrap-0009.ts"),
  dialect: "postgresql",
  dbCredentials: getDevelopmentDatabaseCredentials(),
});
