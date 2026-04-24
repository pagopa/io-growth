import { runAllMigrations } from "@pagopa/io-core-adapter-drizzle";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
  connection: {
    database: process.env.POSTGRES_DB ?? "postgres",
    host: process.env.POSTGRES_HOST ?? "localhost",
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT ?? "5432"),
    user: process.env.POSTGRES_USER ?? "postgres",
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
