import {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { CustomFetch, InpsCedClientOptions } from "../../client.js";
import type { GestioneDomandaCedRepository } from "../../domain/ports/outbound/gestione-domanda-ced.repository.js";
import type {
  checkDomandaResponse,
  confermaDomandaResponse,
  fornisciFotoResponse,
  nuovaDomandaInBozzaResponse,
  recuperoDatiDomandaResponse,
  richiediRicevutaResponse,
  richiediRiepilogoResponse,
  richiediStatoResponse,
} from "../../generated/endpoints/domanda/domanda.js";
import type { RecuperoDatiDomandaResponse } from "../../generated/model/index.js";

import { createCustomFetch } from "../../client.js";
import {
  getCheckDomandaUrl,
  getConfermaDomandaUrl,
  getFornisciFotoUrl,
  getNuovaDomandaInBozzaUrl,
  getRecuperoDatiDomandaUrl,
  getRichiediRicevutaUrl,
  getRichiediRiepilogoUrl,
  getRichiediStatoUrl,
} from "../../generated/endpoints/domanda/domanda.js";

const post = <T>(
  customFetch: CustomFetch,
  url: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T> =>
  customFetch<T>(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
    method: "POST",
  });

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

const createSubmissionOperations = (
  customFetch: CustomFetch,
): Pick<
  GestioneDomandaCedRepository,
  "checkDomanda" | "confermaDomanda" | "fornisciFoto" | "nuovaDomandaInBozza"
> => ({
  checkDomanda: async (request) => {
    try {
      const response = await post<checkDomandaResponse>(
        customFetch,
        getCheckDomandaUrl(),
        request,
      );
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
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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
      const response = await post<confermaDomandaResponse>(
        customFetch,
        getConfermaDomandaUrl(),
        request,
        { "Idempotency-Key": idempotencyKey },
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `confermaDomanda rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
      return err(
        new GenericError(
          `confermaDomanda failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`confermaDomanda failed: ${String(error)}`));
    }
  },

  fornisciFoto: async (request, { idempotencyKey }) => {
    try {
      const response = await post<fornisciFotoResponse>(
        customFetch,
        getFornisciFotoUrl(),
        request,
        { "Idempotency-Key": idempotencyKey },
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `fornisciFoto rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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
      const response = await post<nuovaDomandaInBozzaResponse>(
        customFetch,
        getNuovaDomandaInBozzaUrl(),
        request,
        { "Idempotency-Key": idempotencyKey },
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `nuovaDomandaInBozza rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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
});

const createQueryOperations = (
  customFetch: CustomFetch,
): Pick<
  GestioneDomandaCedRepository,
  | "recuperoDatiDomanda"
  | "richiediRicevuta"
  | "richiediRiepilogo"
  | "richiediStato"
> => ({
  recuperoDatiDomanda: async (request) => {
    try {
      const response = await post<recuperoDatiDomandaResponse>(
        customFetch,
        getRecuperoDatiDomandaUrl(),
        request,
      );
      if (response.status === 200)
        return ok(normalizeRecoveredDraftDateTimes(response.data));
      if (response.status === 400)
        return err(
          new ValidationError(
            `recuperoDatiDomanda rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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
      const response = await post<richiediRicevutaResponse>(
        customFetch,
        getRichiediRicevutaUrl(),
        request,
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
      return err(
        new GenericError(
          `richiediRicevuta failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`richiediRicevuta failed: ${String(error)}`));
    }
  },

  richiediRiepilogo: async (request) => {
    try {
      const response = await post<richiediRiepilogoResponse>(
        customFetch,
        getRichiediRiepilogoUrl(),
        request,
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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
      const response = await post<richiediStatoResponse>(
        customFetch,
        getRichiediStatoUrl(),
        request,
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", JSON.stringify(response.data)));
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

/**
 * Creates the GestioneDomandaCED outbound adapter on top of an injected
 * `customFetch`, so the same adapter can be bound to any INPS environment.
 *
 * Identity context (userId, codiceUfficio) is not passed explicitly — it is
 * resolved by the `customFetch` from the getter injected by the app layer.
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
export const createGestioneDomandaCedClient = (
  customFetch: CustomFetch,
): GestioneDomandaCedRepository => ({
  ...createSubmissionOperations(customFetch),
  ...createQueryOperations(customFetch),
});

/** Builds the adapter bound to a single INPS environment's client options. */
export const createInpsCedClient = (
  options: InpsCedClientOptions,
): GestioneDomandaCedRepository =>
  createGestioneDomandaCedClient(createCustomFetch(options));
