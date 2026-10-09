import { Pool } from "pg";

import type { PgBossConnectionConfig } from "./scheduler.js";

const SCHEMA = "io_core_scheduler";
const TABLE = `${SCHEMA}.revision_registry`;
const SETUP_LOCK_KEY = "io_core_scheduler.revision_registry.setup";

export interface RevisionRegistry {
  readonly claim: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly ensureTable: () => Promise<void>;
  readonly isOwner: () => Promise<boolean>;
}

/**
 * Orders revisions by first registration: the latest one to register owns the
 * scheduled jobs. Rows must never be pruned, or an old revision restarting
 * would look unseen and take ownership back.
 */
export const createRevisionRegistry = (
  connection: PgBossConnectionConfig,
  revision: string,
): RevisionRegistry => {
  const pool = new Pool({
    database: connection.database,
    host: connection.host,
    max: 2,
    password: connection.password,
    port: connection.port,
    ssl: connection.ssl ? true : undefined,
    user: connection.user,
  });
  let closed = false;

  const ensureTable = async (): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Xact-level lock stays valid behind a transaction-pooling pgbouncer.
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
        SETUP_LOCK_KEY,
      ]);
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);
      await client.query(
        `CREATE TABLE IF NOT EXISTS ${TABLE} (
          generation BIGSERIAL PRIMARY KEY,
          revision TEXT NOT NULL UNIQUE,
          registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`,
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  };

  const claim = async (): Promise<void> => {
    await pool.query(
      `INSERT INTO ${TABLE} (revision) VALUES ($1) ON CONFLICT (revision) DO NOTHING`,
      [revision],
    );
  };

  const isOwner = async (): Promise<boolean> => {
    const { rows } = await pool.query<{ revision: string }>(
      `SELECT revision FROM ${TABLE} ORDER BY generation DESC LIMIT 1`,
    );
    return rows[0]?.revision === revision;
  };

  const close = async (): Promise<void> => {
    if (closed) {
      return;
    }
    closed = true;
    await pool.end();
  };

  return { claim, close, ensureTable, isOwner };
};
