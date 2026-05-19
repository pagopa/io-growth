import { runAllMigrations } from "@pagopa/io-core-adapter-drizzle";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseConfig } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = parseConfig();

const dbConfig = {
  connection: {
    database: config.POSTGRES_DB,
    host: config.POSTGRES_HOST,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  },
  migrationsFolder: resolve(__dirname, "../drizzle/migrations"),
  recurrentFolder: resolve(__dirname, "../drizzle/recurrent"),
};

try {
  await runAllMigrations(dbConfig);
  console.log("[migrate] Done.");
  process.exit(0);
} catch (err) {
  console.error("[migrate] Migration failed:", err);
  process.exit(1);
}
