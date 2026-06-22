import { getRequestSession } from "../async-local-storage/async-local-storage-session.repository.js";

export interface DbAuditContext {
  readonly operatorExternalId: string;
  readonly referentExternalId: string;
  readonly referentFullname: string;
}

export const getDbAuditContext = (): DbAuditContext | undefined => {
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
