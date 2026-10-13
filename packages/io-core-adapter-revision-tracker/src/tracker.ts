import postgres from "postgres";

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface Tracker {
  readonly close: () => Promise<void>;
  /** True when this revision is the latest one registered. */
  readonly isLatest: () => Promise<boolean>;
  /** Records this revision, creating the registry table if missing. Idempotent. */
  readonly register: () => Promise<void>;
}

export interface TrackerConfig {
  readonly connection: TrackerConnectionConfig;
  /** Identifies the deployed revision this tracker speaks for. */
  readonly revision: string;
  readonly table: TrackerTableConfig;
}

export interface TrackerConnectionConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly user: string;
}

export interface TrackerTableConfig {
  readonly name: string;
  readonly schema: string;
}

const assertIdentifier = (label: string, value: string): void => {
  if (!IDENTIFIER_PATTERN.test(value)) {
    throw new Error(`Invalid ${label} identifier: ${value}`);
  }
};

/**
 * Orders revisions by first registration: the latest one to register is the
 * latest. Rows must never be pruned, or an old revision restarting would look
 * unseen and take the latest position back.
 */
export const createTracker = (config: TrackerConfig): Tracker => {
  const { connection, revision, table } = config;
  assertIdentifier("schema", table.schema);
  assertIdentifier("table", table.name);

  const sql = postgres({
    database: connection.database,
    host: connection.host,
    max: 2,
    onnotice: () => undefined,
    password: connection.password,
    port: connection.port,
    prepare: false,
    ssl: connection.ssl ? "require" : false,
    user: connection.user,
  });

  const setupLockKey = `${table.schema}.${table.name}.setup`;
  let registration: Promise<void> | undefined;
  let closed = false;

  const ensureTableAndRegister = async (): Promise<void> => {
    await sql.begin(async (tx) => {
      // Xact-level lock stays valid behind a transaction-pooling pgbouncer.
      await tx`SELECT pg_advisory_xact_lock(hashtext(${setupLockKey}))`;
      await tx`CREATE SCHEMA IF NOT EXISTS ${tx(table.schema)}`;
      await tx`CREATE TABLE IF NOT EXISTS ${tx(table.schema)}.${tx(table.name)} (
        generation BIGSERIAL PRIMARY KEY,
        revision TEXT NOT NULL UNIQUE,
        registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
      await tx`INSERT INTO ${tx(table.schema)}.${tx(table.name)} (revision)
        VALUES (${revision}) ON CONFLICT (revision) DO NOTHING`;
    });
  };

  const register = (): Promise<void> => {
    registration ??= ensureTableAndRegister().catch((error: unknown) => {
      registration = undefined;
      throw error;
    });
    return registration;
  };

  const isLatest = async (): Promise<boolean> => {
    const rows = await sql<{ revision: string }[]>`
      SELECT revision FROM ${sql(table.schema)}.${sql(table.name)}
      ORDER BY generation DESC LIMIT 1`;
    return rows[0]?.revision === revision;
  };

  const close = async (): Promise<void> => {
    if (closed) {
      return;
    }
    closed = true;
    await sql.end();
  };

  return { close, isLatest, register };
};
