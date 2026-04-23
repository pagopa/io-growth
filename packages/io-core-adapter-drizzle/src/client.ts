import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export interface DrizzleConnectionConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly user: string;
}

export type DrizzleDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = PostgresJsDatabase<TSchema>;

export interface RuntimeClientConfig extends DrizzleConnectionConfig {
  readonly max?: number;
}

export type SqlClient = ReturnType<typeof postgres>;

export const createMigrationClient = (
  config: DrizzleConnectionConfig,
): SqlClient =>
  postgres({
    database: config.database,
    host: config.host,
    max: 1,
    password: config.password,
    port: config.port,
    ssl: config.ssl ? "require" : false,
    user: config.user,
  });

export const createRuntimeClient = <
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  config: RuntimeClientConfig,
  schema?: TSchema,
): { db: DrizzleDatabase<TSchema>; sql: SqlClient } => {
  const sql = postgres({
    database: config.database,
    host: config.host,
    max: config.max ?? 10,
    password: config.password,
    port: config.port,
    ssl: config.ssl ? "require" : false,
    user: config.user,
  });

  const db = drizzle(sql, { schema: schema ?? ({} as TSchema) });

  return { db, sql };
};
