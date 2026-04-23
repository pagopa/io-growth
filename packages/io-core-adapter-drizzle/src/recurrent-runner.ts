import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { SqlClient } from "./client.js";

const LOCK_KEY = 789_012_345;

const sha256 = (content: string): string =>
  createHash("sha256").update(content).digest("hex");

const ensureRecurrentTable = async (sql: SqlClient): Promise<void> => {
  await sql`
    CREATE TABLE IF NOT EXISTS _recurrent_migrations (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
};

export const runRecurrentMigrations = async (
  sql: SqlClient,
  recurrentFolder: string,
): Promise<void> => {
  console.log(
    `[drizzle] Running recurrent migrations from: ${recurrentFolder}`,
  );

  let files: string[];
  try {
    const entries = await readdir(recurrentFolder);
    files = entries
      .filter((f) => f.startsWith("R__") && f.endsWith(".sql"))
      .sort();
  } catch {
    console.log("[drizzle] Recurrent folder not found or empty. Skipping.");
    return;
  }

  if (files.length === 0) {
    console.log("[drizzle] No R__*.sql files found. Skipping.");
    return;
  }

  await sql`SELECT pg_advisory_lock(${LOCK_KEY})`;
  try {
    await ensureRecurrentTable(sql);

    for (const file of files) {
      const content = await readFile(join(recurrentFolder, file), "utf8");
      const checksum = sha256(content);

      const [existing] = await sql`
        SELECT checksum FROM _recurrent_migrations WHERE filename = ${file}
      `;

      if (existing && existing.checksum === checksum) {
        console.log(`[drizzle] R__ skip (unchanged): ${file}`);
        continue;
      }

      console.log(
        `[drizzle] R__ applying: ${file} (${existing ? "changed" : "new"})`,
      );
      await sql.unsafe(content);

      await sql`
        INSERT INTO _recurrent_migrations (filename, checksum, applied_at)
        VALUES (${file}, ${checksum}, now())
        ON CONFLICT (filename) DO UPDATE SET checksum = ${checksum}, applied_at = now()
      `;
    }
  } finally {
    await sql`SELECT pg_advisory_unlock(${LOCK_KEY})`;
  }

  console.log("[drizzle] Recurrent migrations completed.");
};
