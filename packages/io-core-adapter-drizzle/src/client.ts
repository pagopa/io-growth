import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type RawSqlClient = ReturnType<typeof postgres>;

export interface RawSqlClientConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly user: string;
}

export type TypedDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = PostgresJsDatabase<TSchema>;

export type TypedDbClient<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = TypedDatabase<TSchema> & { readonly closeConnection: () => Promise<void> };

export interface TypedDbClientConfig extends RawSqlClientConfig {
  readonly max?: number;
}

export const createRawSqlClient = (config: RawSqlClientConfig): RawSqlClient =>
  postgres({
    database: config.database,
    host: config.host,
    max: 1,
    password: config.password,
    port: config.port,
    ssl: config.ssl ? "require" : false,
    user: config.user,
  });

export const createTypedDbClient = <
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  config: TypedDbClientConfig,
  schema?: TSchema,
): TypedDbClient<TSchema> => {
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

  return Object.assign(db, { closeConnection: () => sql.end() });
};
