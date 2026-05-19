import { runAllMigrations } from "@pagopa/io-core-adapter-drizzle";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseConfig } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const appConfig = parseConfig();

const config = {
  connection: {
    database: appConfig.POSTGRES_DB,
    host: appConfig.POSTGRES_HOST,
    password: appConfig.POSTGRES_PASSWORD,
    port: appConfig.POSTGRES_PORT,
    ssl: appConfig.POSTGRES_SSL,
    user: appConfig.POSTGRES_USER,
  },
  migrationsFolder: resolve(__dirname, "../drizzle/migrations"),
  recurrentFolder: resolve(__dirname, "../drizzle/recurrent"),
};

try {
  await runAllMigrations(config);
  console.log("[migrate] Done.");
  process.exit(0);
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exit(1);
}
