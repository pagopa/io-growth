import { runAllMigrations } from "@pagopa/io-core-adapter-drizzle";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const args = process.argv.filter((a) => a.includes("env="));

if (args.length !== 1) {
  console.error(
    "[migrate] Wrong migration argument: you must define just 1 env argument",
  );
  process.exit(1);
}

const env = args[0].split("=")[1];

if (env !== "test" && env !== "prod") {
  console.error(
    "[migrate] Wrong migration argument: allowed env value is test | prod",
  );
  process.exit(1);
}

const isTest = env === "test";

console.log(`[migrate] Starting migrations for env: ${env}`);

const migrateConfigSchema = z.object({
  POSTGRES_DB: z.string().min(1),
  POSTGRES_DB_TEST: z.string().min(1),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(6432),
  POSTGRES_SSL: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  POSTGRES_USER: z.string().min(1),
});

const __dirname = dirname(fileURLToPath(import.meta.url));

const result = migrateConfigSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid migration configuration:\n${result.error.message}`);
}
const config = result.data;

const dbConfig = {
  connection: {
    database: isTest ? config.POSTGRES_DB_TEST : config.POSTGRES_DB,
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
