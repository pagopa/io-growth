import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { SqlClient } from "./client.js";

const LOCK_KEY = 789_012_346;

const ensureMigrationsTable = async (sql: SqlClient): Promise<void> => {
  await sql`
    CREATE TABLE IF NOT EXISTS _versioned_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
};

export const runVersionedMigrations = async (
  sql: SqlClient,
  migrationsFolder: string,
): Promise<void> => {
  console.log(
    `[migrations] Running versioned migrations from: ${migrationsFolder}`,
  );

  let files: string[];
  try {
    const entries = await readdir(migrationsFolder);
    files = entries.filter((f) => f.endsWith(".sql")).sort();
  } catch {
    console.log("[migrations] Migrations folder not found. Skipping.");
    return;
  }

  if (files.length === 0) {
    console.log("[migrations] No .sql files found. Skipping.");
    return;
  }

  await sql`SELECT pg_advisory_lock(${LOCK_KEY})`;
  try {
    await ensureMigrationsTable(sql);

    for (const file of files) {
      const [existing] = await sql`
        SELECT filename FROM _versioned_migrations WHERE filename = ${file}
      `;

      if (existing) {
        console.log(`[migrations] skip (already applied): ${file}`);
        continue;
      }

      console.log(`[migrations] applying: ${file}`);
      const content = await readFile(join(migrationsFolder, file), "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(content);
        await tx`
          INSERT INTO _versioned_migrations (filename, applied_at)
          VALUES (${file}, now())
        `;
      });
    }
  } finally {
    await sql`SELECT pg_advisory_unlock(${LOCK_KEY})`;
  }

  console.log("[migrations] Versioned migrations completed.");
};
