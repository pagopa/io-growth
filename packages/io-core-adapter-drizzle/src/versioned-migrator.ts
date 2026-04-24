import type { RawSqlClientConfig } from "./client.js";

import { createRawSqlClient } from "./client.js";
import { runVersionedMigrations } from "./migrator.js";
import { runRecurrentMigrations } from "./recurrent-migrator.js";

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
    await runVersionedMigrations(sql, config.migrationsFolder);
    await runRecurrentMigrations(sql, config.recurrentFolder);
  } finally {
    await sql.end();
  }

  console.log("[migrations] All migrations completed successfully.");
};
