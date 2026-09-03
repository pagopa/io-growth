import {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { GestioneDomandaCedRepository } from "../../domain/ports/outbound/gestione-domanda-ced.repository.js";
import type { RecuperoDatiDomandaResponse } from "../../generated/model/index.js";

// These imports are satisfied after `pnpm generate` runs.
import {
  checkDomanda as checkDomandaGen,
  confermaDomanda as confermaDomandaGen,
  fornisciFoto as fornisciFotoGen,
  nuovaDomandaInBozza as nuovaDomandaInBozzaGen,
  recuperoDatiDomanda as recuperoDatiDomandaGen,
  richiediRicevuta as richiediRicevutaGen,
  richiediRiepilogo as richiediRiepilogoGen,
  richiediStato as richiediStatoGen,
} from "../../generated/endpoints/domanda/domanda.js";

const OFFSET_LESS_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

// FIX: TODO: INPS currently omits the RFC 3339 offset declared by its OpenAPI
// contract. Remove this adapter compatibility workaround once the upstream
// response becomes compliant.
const normalizeInpsDateTime = (value: string): string =>
  OFFSET_LESS_DATE_TIME.test(value) ? `${value}Z` : value;

const normalizeRecoveredDraftDateTimes = (
  response: RecuperoDatiDomandaResponse,
): RecuperoDatiDomandaResponse => {
  const permitExpiration = response.anagrafica.dataScadenzaPermessoSoggiorno;

  return {
    ...response,
    anagrafica: {
      ...response.anagrafica,
      dataNascita: normalizeInpsDateTime(response.anagrafica.dataNascita),
      dataScadenzaPermessoSoggiorno:
        permitExpiration == null
          ? permitExpiration
          : normalizeInpsDateTime(permitExpiration),
    },
  };
};

/**
 * Creates the GestioneDomandaCED outbound adapter.
 *
 * Identity context (userId, codiceUfficio) is NOT passed explicitly — it is
 * read from AsyncLocalStorage by the `customFetch` mutator. The application
 * layer is responsible for establishing the context before use cases run,
 * using `runWithInpsIdentity` (mirroring the `createSessionContextPreHandler`
 * pattern in ced-portal-be).
 *
 * Error mapping (HTTP-status based, ProblemDetails model):
 *  - 400 → ValidationError (or ConflictError if response indicates conflict)
 *  - 404 → NotFoundError
 *  - 500 → GenericError
 *
 * NOTE: INPS business-outcome codes (active card, residence checks, etc.) are
 * expected to surface in ProblemDetails fields. Exact mapping TBC after
 * adhesion testing — update the 400 branch once confirmed with INPS.
 */
export const createGestioneDomandaCedClient =
  (): GestioneDomandaCedRepository => ({
    checkDomanda: async (request) => {
      try {
        const response = await checkDomandaGen(request);
        if (response.status === 200) return ok(response.data);
        // 401 is not declared in the OpenAPI spec but INPS returns it when the
        // mTLS certificate is not yet registered/activated for this API.
        if ((response.status as number) === 401)
          return err(
            new GenericError(
              `INPS returned 401 | ${JSON.stringify(response.data)}`,
            ),
          );
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `checkDomanda failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(new GenericError(`checkDomanda failed: ${String(error)}`));
      }
    },

    confermaDomanda: async (request, { idempotencyKey }) => {
      try {
        const response = await confermaDomandaGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        });
        if (response.status === 200) return ok(response.data);
        if (response.status === 400)
          return err(
            new ValidationError(
              `confermaDomanda rejected: ${JSON.stringify(response.data)}`,
            ),
          );
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `confermaDomanda failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`confermaDomanda failed: ${String(error)}`),
        );
      }
    },

    fornisciFoto: async (request, { idempotencyKey }) => {
      try {
        const response = await fornisciFotoGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        });
        if (response.status === 200) return ok(response.data);
        if (response.status === 400)
          return err(
            new ValidationError(
              `fornisciFoto rejected: ${JSON.stringify(response.data)}`,
            ),
          );
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `fornisciFoto failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(new GenericError(`fornisciFoto failed: ${String(error)}`));
      }
    },

    nuovaDomandaInBozza: async (request, { idempotencyKey }) => {
      try {
        const response = await nuovaDomandaInBozzaGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        });
        if (response.status === 200) return ok(response.data);
        if (response.status === 400)
          return err(
            new ValidationError(
              `nuovaDomandaInBozza rejected: ${JSON.stringify(response.data)}`,
            ),
          );
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `nuovaDomandaInBozza failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`nuovaDomandaInBozza failed: ${String(error)}`),
        );
      }
    },

    recuperoDatiDomanda: async (request) => {
      try {
        const response = await recuperoDatiDomandaGen(request);
        if (response.status === 200)
          return ok(normalizeRecoveredDraftDateTimes(response.data));
        if (response.status === 400)
          return err(
            new ValidationError(
              `recuperoDatiDomanda rejected: ${JSON.stringify(response.data)}`,
            ),
          );
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `recuperoDatiDomanda failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`recuperoDatiDomanda failed: ${String(error)}`),
        );
      }
    },

    richiediRicevuta: async (request) => {
      try {
        const response = await richiediRicevutaGen(request);
        if (response.status === 200) return ok(response.data);
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `richiediRicevuta failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`richiediRicevuta failed: ${String(error)}`),
        );
      }
    },

    richiediRiepilogo: async (request) => {
      try {
        const response = await richiediRiepilogoGen(request);
        if (response.status === 200) return ok(response.data);
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `richiediRiepilogo failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(
          new GenericError(`richiediRiepilogo failed: ${String(error)}`),
        );
      }
    },

    richiediStato: async (request) => {
      try {
        const response = await richiediStatoGen(request);
        if (response.status === 200) return ok(response.data);
        if (response.status === 404)
          return err(
            new NotFoundError("domanda", JSON.stringify(response.data)),
          );
        return err(
          new GenericError(
            `richiediStato failed with status ${String(response.status)}`,
          ),
        );
      } catch (error) {
        return err(new GenericError(`richiediStato failed: ${String(error)}`));
      }
    },
  });
