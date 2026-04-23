import type { DrizzleConnectionConfig } from "./client.js";

import { createPostgresClient } from "./client.js";
import { runVersionedMigrations } from "./migrator.js";
import { runRecurrentMigrations } from "./recurrent-runner.js";

export interface MigrationConfig {
  readonly connection: DrizzleConnectionConfig;
  readonly migrationsFolder: string;
  readonly recurrentFolder: string;
}

export const runAllMigrations = async (
  config: MigrationConfig,
): Promise<void> => {
  console.log("[migrations] Starting migration run...");

  const sql = await createPostgresClient(config.connection);

  try {
    await runVersionedMigrations(sql, config.migrationsFolder);
    await runRecurrentMigrations(sql, config.recurrentFolder);
  } finally {
    await sql.end();
  }

  console.log("[migrations] All migrations completed successfully.");
};
