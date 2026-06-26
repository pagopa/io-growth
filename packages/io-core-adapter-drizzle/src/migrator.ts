import type { RawSqlClientConfig } from "./client.js";

import { createRawSqlClient } from "./client.js";
import { runRecurrentMigrations } from "./recurrent-migrator.js";
import { runVersionedMigrations } from "./versioned-migrator.js";

// Single lock key covering the full migration pipeline.
// Ensures no other instance can interleave versioned and recurrent phases.
const LOCK_KEY = 789_012_344;

export interface MigrationConfig {
  readonly connection: RawSqlClientConfig;
  readonly migrationsFolder: string;
  readonly recurrentFolder: string;
}

export const runAllMigrations = async (
  config: MigrationConfig,
): Promise<void> => {
  console.log("[migrations] Starting migration run...");

  const sql = createRawSqlClient(config.connection);

  try {
    await sql`SELECT pg_advisory_lock(${LOCK_KEY})`;
    try {
      await runVersionedMigrations(sql, config.migrationsFolder);
      await runRecurrentMigrations(
        sql,
        config.recurrentFolder,
        config.connection,
      );
    } finally {
      await sql`SELECT pg_advisory_unlock(${LOCK_KEY})`;
    }
  } finally {
    await sql.end();
  }

  console.log("[migrations] All migrations completed successfully.");
};
