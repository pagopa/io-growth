import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Result } from "neverthrow";

import { AsyncLocalStorage } from "node:async_hooks";

import type { CardRequestSession } from "./adapters/inbound/fastify/auth/session.js";

const storage = new AsyncLocalStorage<CardRequestSession>();

/**
 * Reads the current request's session from AsyncLocalStorage.
 *
 * Used by the composition root to build the `getIdentity` closure injected
 * into the INPS-CED client, which needs per-request identity (fiscal code)
 * deep inside the orval-generated call chain where the Fastify request is not
 * available. Mirrors the pattern in ced-portal-be.
 */
export const getRequestSession = (): CardRequestSession | undefined =>
  storage.getStore();

export const createSessionContextPreHandler =
  (
    getSession: (
      request: FastifyRequest,
    ) => Promise<Result<CardRequestSession, BaseError>>,
  ) =>
  (
    request: FastifyRequest,
    _reply: FastifyReply,
    done: (err?: Error) => void,
  ): void => {
    getSession(request)
      .then((result) => {
        if (result.isOk()) {
          storage.run(result.value, done);
        } else {
          done(result.error);
        }
      })
      .catch((e: unknown) =>
        done(e instanceof Error ? e : new Error(String(e))),
      );
  };
