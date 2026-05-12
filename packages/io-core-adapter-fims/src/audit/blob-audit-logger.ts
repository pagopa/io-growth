import type { ContainerClient } from "@azure/storage-blob";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { randomBytes } from "node:crypto";

import type { AuditLogger } from "../domain/ports.js";
import type { FimsExchangeAudit, LollipopAudit } from "../domain/types.js";

import { hashFiscalCode } from "../use-cases/test-users.js";

const OPERATION_FIMS = "fims";
const OPERATION_LOLLIPOP = "lollipop";

/**
 * Generate a unique blob name for an audit log entry.
 *
 * Pattern mirrors io-cdc `generateBlobName`:
 * `${hash(fiscalCode)}-${ISODateTime}-${operationType}-${randomHex(3)}`
 */
const generateBlobName = (
  fiscalCode: string,
  operationType: string,
): string => {
  const dateTime = new Date().toISOString();
  const randomPart = randomBytes(3).toString("hex");
  return `${hashFiscalCode(fiscalCode)}-${dateTime}-${operationType}-${randomPart}`;
};

const uploadAuditBlob = async (
  containerClient: ContainerClient,
  fiscalCode: string,
  operationType: string,
  content: string,
  tags: Record<string, string>,
): Promise<Result<void, BaseError>> => {
  try {
    const blobName = generateBlobName(fiscalCode, operationType);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.upload(
      content,
      Buffer.byteLength(content),
      { tags },
    );
    if (response._response.status >= 300) {
      return err(
        new GenericError(
          `Audit log upload failed with HTTP status ${response._response.status}`,
        ),
      );
    }
    return ok(undefined);
  } catch (error) {
    return err(new GenericError(`Audit log upload failed: ${String(error)}`));
  }
};

/**
 * Azure Blob Storage-backed AuditLogger.
 *
 * Writes immutable audit records to an Azure Blob container.
 * Blob name format: `${sha256(fiscalCode)}-${ISODateTime}-${type}-${randomHex(3)}`.
 * Blob tags allow server-side filtering by FiscalCode, DateTime, and Type.
 *
 * The caller is responsible for creating the `ContainerClient` (e.g. using
 * `BlobServiceClient` + `DefaultAzureCredential`) and injecting it here.
 * This mirrors the audit log pattern in pagopa/io-cdc `utils/audit_logs.ts`.
 */
export const createBlobAuditLogger = (
  containerClient: ContainerClient,
): AuditLogger => ({
  logFimsExchange: (
    data: FimsExchangeAudit,
  ): Promise<Result<void, BaseError>> => {
    const content = JSON.stringify({
      authCode: data.authCode,
      fiscalCode: data.fiscalCode,
    });
    const tags = {
      DateTime: new Date().toISOString(),
      FiscalCode: data.fiscalCode,
      Type: OPERATION_FIMS,
    };
    return uploadAuditBlob(
      containerClient,
      data.fiscalCode,
      OPERATION_FIMS,
      content,
      tags,
    );
  },

  logLollipopVerification: (
    data: LollipopAudit,
  ): Promise<Result<void, BaseError>> => {
    const content = JSON.stringify({
      assertion: data.assertion,
      assertionRef: data.assertionRef,
      fiscalCode: data.fiscalCode,
      publicKey: data.publicKey,
    });
    const tags = {
      DateTime: new Date().toISOString(),
      FiscalCode: data.fiscalCode,
      Type: OPERATION_LOLLIPOP,
    };
    return uploadAuditBlob(
      containerClient,
      data.fiscalCode,
      OPERATION_LOLLIPOP,
      content,
      tags,
    );
  },
});
