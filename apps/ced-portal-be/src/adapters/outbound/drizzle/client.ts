import type { RuntimeClientConfig } from "@pagopa/io-core-adapter-drizzle";

import { createRuntimeClient } from "@pagopa/io-core-adapter-drizzle";

import * as schema from "./schema/index.js";

const config: RuntimeClientConfig = {
  database: process.env.POSTGRES_DB ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  max: Number(process.env.POSTGRES_MAX_CONNECTIONS ?? "10"),
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT ?? "6432"),
  user: process.env.POSTGRES_USER ?? "postgres",
};

const { db, sql } = createRuntimeClient(config, schema);

export { db, sql };
