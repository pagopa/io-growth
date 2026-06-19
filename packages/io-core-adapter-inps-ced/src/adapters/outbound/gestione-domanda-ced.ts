import {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { GestioneDomandaCedRepository } from "../../domain/ports/outbound/gestione-domanda-ced.repository.js";

import { identityStore } from "../../client.js";
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

const resolveIdentity = (
  identity: { codiceUfficio?: string; userId: string },
  defaultCodiceUfficio: string,
) => ({
  codiceUfficio: identity.codiceUfficio ?? defaultCodiceUfficio,
  userId: identity.userId,
});

/**
 * Creates the GestioneDomandaCED outbound adapter.
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
  defaultCodiceUfficio: string,
): GestioneDomandaCedRepository => ({
  checkDomanda: async (request, identity) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        checkDomandaGen(request),
      );
      if (response.status === 200) return ok(response.data);
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

  confermaDomanda: async (request, identity, { idempotencyKey }) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        confermaDomandaGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `confermaDomanda rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
      return err(
        new GenericError(
          `confermaDomanda failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`confermaDomanda failed: ${String(error)}`));
    }
  },

  fornisciFoto: async (request, identity, { idempotencyKey }) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        fornisciFotoGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `fornisciFoto rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
      return err(
        new GenericError(
          `fornisciFoto failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`fornisciFoto failed: ${String(error)}`));
    }
  },

  nuovaDomandaInBozza: async (request, identity, { idempotencyKey }) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        nuovaDomandaInBozzaGen(request, {
          headers: { "Idempotency-Key": idempotencyKey },
        }),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 400)
        return err(
          new ValidationError(
            `nuovaDomandaInBozza rejected: ${JSON.stringify(response.data)}`,
          ),
        );
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
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

  recuperoDatiDomanda: async (request, identity) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        recuperoDatiDomandaGen(request),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
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

  richiediRicevuta: async (request, identity) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        richiediRicevutaGen(request),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
      return err(
        new GenericError(
          `richiediRicevuta failed with status ${String(response.status)}`,
        ),
      );
    } catch (error) {
      return err(new GenericError(`richiediRicevuta failed: ${String(error)}`));
    }
  },

  richiediRiepilogo: async (request, identity) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        richiediRiepilogoGen(request),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
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

  richiediStato: async (request, identity) => {
    const ctx = resolveIdentity(identity, defaultCodiceUfficio);
    try {
      const response = await identityStore.run(ctx, () =>
        richiediStatoGen(request),
      );
      if (response.status === 200) return ok(response.data);
      if (response.status === 404)
        return err(new NotFoundError("domanda", String(response.status)));
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
