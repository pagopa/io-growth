import type { PgTransaction, PgTransactionConfig } from "drizzle-orm/pg-core";
import type {
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export type OnTransactionHook<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = (
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    TSchema,
    ExtractTablesWithRelations<TSchema>
  >,
) => Promise<void>;

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

export interface TypedDbClientConfig<
  TSchema extends Record<string, unknown> = Record<string, never>,
> extends RawSqlClientConfig {
  readonly max?: number;
  readonly onNotice?: (notice: { message: string }) => void;
  readonly onTransaction?: OnTransactionHook<TSchema>;
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
  config: TypedDbClientConfig<TSchema>,
  schema?: TSchema,
): TypedDbClient<TSchema> => {
  const sql = postgres({
    database: config.database,
    host: config.host,
    max: config.max ?? 10,
    onnotice: (notice) => {
      config.onNotice?.(notice as { message: string });
    },
    password: config.password,
    port: config.port,
    ssl: config.ssl ? "require" : false,
    user: config.user,
  });

  const db = drizzle(sql, { schema: schema ?? ({} as TSchema) });

  const patchedDb = Object.assign(db, { closeConnection: () => sql.end() });

  if (!config.onTransaction) {
    return patchedDb;
  }

  const onTx = config.onTransaction;
  const originalTransaction = db.transaction.bind(db);

  return Object.assign(patchedDb, {
    transaction: <T>(
      fn: (
        tx: PgTransaction<
          PostgresJsQueryResultHKT,
          TSchema,
          ExtractTablesWithRelations<TSchema>
        >,
      ) => Promise<T>,
      txConfig?: PgTransactionConfig,
    ): Promise<T> =>
      originalTransaction(async (tx) => {
        await onTx(tx);
        return fn(tx);
      }, txConfig),
  });
};
