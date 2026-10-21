import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Result } from "neverthrow";
import type { z } from "zod";

import { sendErrorResponse } from "@pagopa/io-core-adapter-fastify";
import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { AsyncLocalStorage } from "node:async_hooks";

import type { CitizenSessionSchema } from "./adapters/inbound/fastify/auth/session.js";

export type CitizenSession = z.infer<typeof CitizenSessionSchema>;

const storage = new AsyncLocalStorage<CitizenSession>();

export const getRequestSession = (): CitizenSession | undefined =>
  storage.getStore();

export const createSessionContextPreHandler =
  (
    getSession: (
      request: FastifyRequest,
    ) => Promise<Result<CitizenSession, BaseError>>,
  ) =>
  (
    request: FastifyRequest,
    reply: FastifyReply,
    done: (err?: Error) => void,
  ): void => {
    getSession(request)
      .then((result) => {
        if (result.isOk()) {
          storage.run(result.value, done);
        } else {
          // Expired sessions resolve to null upstream; answer 401, not 500.
          sendErrorResponse(
            reply,
            new UnauthorizedError("Invalid or expired session"),
          );
        }
      })
      .catch((e: unknown) =>
        done(e instanceof Error ? e : new Error(String(e))),
      );
  };
