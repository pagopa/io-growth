import { runAllMigrations } from "@pagopa/io-core-adapter-drizzle";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const migrateConfigSchema = z.object({
  POSTGRES_DB: z.string().min(1),
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
