import type { ExtractTablesWithRelations } from "drizzle-orm/relations";
import { sql as drizzleSql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

import { getRequestSession } from "../../../async-local-storage-session-context.js";
import * as schema from "./schema/index.js";

interface DbAuditContext {
  readonly operatorExternalId: string;
  readonly referentExternalId: string;
  readonly referentFullname: string;
}

const getDbAuditContext = (): DbAuditContext | undefined => {
  const session = getRequestSession();
  if (!session) return undefined;
  const { firstName, lastName, operatorExternalId, referentExternalId } =
    session;
  return {
    operatorExternalId,
    referentExternalId,
    referentFullname: `${lastName} ${firstName}`,
  };
};

export const injectDbAuditContext = async (
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof schema,
    ExtractTablesWithRelations<typeof schema>
  >,
) => {
  const audit = getDbAuditContext();
  if (!audit) return;
  await tx.execute(
    drizzleSql`SELECT set_config('app.referent_fullname', ${audit.referentFullname}, true), set_config('app.operator_external_id', ${audit.operatorExternalId}, true), set_config('app.referent_external_id', ${audit.referentExternalId}, true)`,
  );
};
