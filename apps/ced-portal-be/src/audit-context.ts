import { createAuditStorage } from "@pagopa/io-core-adapter-drizzle";

export interface AuditContext {
  readonly operatorExternalId: string;
  readonly referentExternalId: string;
  readonly referentFullname: string;
}

export const { runWith: runWithAuditContext, transactionAuditData: auditData } =
  createAuditStorage<AuditContext>();
