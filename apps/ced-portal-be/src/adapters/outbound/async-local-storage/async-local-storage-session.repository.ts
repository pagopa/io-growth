import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Result } from "neverthrow";

import { AsyncLocalStorage } from "node:async_hooks";

import type { Session } from "../../../domain/entities/session.js";

const storage = new AsyncLocalStorage<Session>();

export const getRequestSession = (): Session | undefined => storage.getStore();

export const createSessionContextPreHandler =
  (
    getSession: (
      request: FastifyRequest,
    ) => Promise<Result<Session, BaseError>>,
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
