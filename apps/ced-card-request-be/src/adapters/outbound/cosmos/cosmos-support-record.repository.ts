import type { Container, ItemDefinition } from "@azure/cosmos";

import { ServiceUnavailableError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { SupportRecord } from "../../../domain/entities/support-record.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

/**
 * The shape persisted in CosmosDB. `id` and `partitionKey` are both the
 * Citizen's Codice Fiscale (see `docs/ced-card-request/data-model.md`).
 */
interface SupportRecordDocument extends ItemDefinition {
  readonly createdAt: string;
  readonly idLavorazione: null | string;
  readonly lastReconciliation: SupportRecord["lastReconciliation"];
  readonly partitionKey: string;
  readonly pendingStep: SupportRecord["pendingStep"];
  readonly previousIdLavorazione: null | string;
  readonly schemaVersion: SupportRecord["schemaVersion"];
  readonly state: SupportRecord["state"];
  readonly steps: SupportRecord["steps"];
  readonly ttl: number;
  readonly updatedAt: string;
}

const toDocument = (record: SupportRecord): SupportRecordDocument => ({
  createdAt: record.createdAt,
  id: record.codiceFiscale,
  idLavorazione: record.idLavorazione,
  lastReconciliation: record.lastReconciliation,
  partitionKey: record.codiceFiscale,
  pendingStep: record.pendingStep,
  previousIdLavorazione: record.previousIdLavorazione,
  schemaVersion: record.schemaVersion,
  state: record.state,
  steps: record.steps,
  ttl: record.ttl,
  updatedAt: record.updatedAt,
});

const fromDocument = (
  document: SupportRecordDocument,
  etag: string,
): SupportRecord => ({
  _etag: etag,
  codiceFiscale: document.partitionKey,
  createdAt: document.createdAt,
  idLavorazione: document.idLavorazione,
  lastReconciliation: document.lastReconciliation,
  pendingStep: document.pendingStep,
  previousIdLavorazione: document.previousIdLavorazione,
  schemaVersion: document.schemaVersion,
  state: document.state,
  steps: document.steps,
  ttl: document.ttl,
  updatedAt: document.updatedAt,
});

/** Cosmos reports an id/partition-key collision on `.create()` as a 409. */
const isConflictError = (error: unknown): boolean =>
  Number((error as { code?: number | string }).code) === 409;

export const createCosmosSupportRecordRepository = (
  container: Container,
): SupportRecordRepository => ({
  getByCodiceFiscale: async (codiceFiscale) => {
    try {
      // `.read()` does not throw on 404; it resolves with `resource: undefined`.
      const { etag, resource } = await container
        .item(codiceFiscale, codiceFiscale)
        .read<SupportRecordDocument>();
      return ok(resource ? fromDocument(resource, etag) : undefined);
    } catch (error) {
      return err(
        new ServiceUnavailableError(
          `Failed to read support record: ${String(error)}`,
        ),
      );
    }
  },

  save: async (record) => {
    const document = toDocument(record);

    try {
      const { etag, resource } = record._etag
        ? await container
            .item(record.codiceFiscale, record.codiceFiscale)
            .replace<SupportRecordDocument>(document, {
              accessCondition: { condition: record._etag, type: "IfMatch" },
            })
        : await container.items.create<SupportRecordDocument>(document);

      if (!resource) {
        return err(
          new ServiceUnavailableError(
            "Support record write returned no resource",
          ),
        );
      }

      return ok(fromDocument(resource, etag));
    } catch (error) {
      // A stale/racing read can lead `record._etag` to be unset even though a
      // document already exists (e.g. a concurrent request, or a read that
      // momentarily missed a just-written document). Rather than surface a
      // confusing 503 on every subsequent retry, recover by replacing the
      // document that is actually there.
      if (!record._etag && isConflictError(error)) {
        try {
          const { etag: currentEtag, resource: current } = await container
            .item(record.codiceFiscale, record.codiceFiscale)
            .read<SupportRecordDocument>();

          if (current) {
            const { etag, resource } = await container
              .item(record.codiceFiscale, record.codiceFiscale)
              .replace<SupportRecordDocument>(document, {
                accessCondition: { condition: currentEtag, type: "IfMatch" },
              });

            if (resource) return ok(fromDocument(resource, etag));
          }
        } catch (retryError) {
          return err(
            new ServiceUnavailableError(
              `Failed to save support record: ${String(retryError)}`,
            ),
          );
        }
      }

      return err(
        new ServiceUnavailableError(
          `Failed to save support record: ${String(error)}`,
        ),
      );
    }
  },
});
