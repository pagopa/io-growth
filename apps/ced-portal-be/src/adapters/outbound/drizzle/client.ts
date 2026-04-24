import type { TypedDbClientConfig } from "@pagopa/io-core-adapter-drizzle";

import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import * as schema from "./schema/index.js";

const config: TypedDbClientConfig = {
  database: process.env.POSTGRES_DB ?? "postgres",
  host: process.env.POSTGRES_HOST ?? "localhost",
  max: Number(process.env.POSTGRES_MAX_CONNECTIONS ?? "10"),
  password: process.env["ced-p-itn-db-psql-01-backend-password"],
  port: Number(process.env.POSTGRES_PORT ?? "6432"),
  user: process.env["ced-p-itn-db-psql-01-backend-user"] ?? "postgres",
};

export const dbClient = createTypedDbClient(config, schema);
