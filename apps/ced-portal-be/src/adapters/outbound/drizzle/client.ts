import type { DrizzleConnectionConfig } from "@pagopa/io-core-adapter-drizzle";

import { createPostgresClient } from "@pagopa/io-core-adapter-drizzle";

const config: DrizzleConnectionConfig = {
  database: process.env.POSTGRES_DB ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT ?? "5432"),
  useEntraId: process.env.USE_ENTRA_ID === "true",
  user: process.env.POSTGRES_USER ?? "postgres",
};

export const sql = await createPostgresClient(config);
