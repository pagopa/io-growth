import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from "fastify";

import { sendErrorResponse } from "@pagopa/io-core-adapter-fastify";
import { ValidationError } from "@pagopa/io-core-domain/errors";
import Fastify from "fastify";
import { z } from "zod";

import type { FimsAuthFlow } from "../use-cases/fims-auth-flow.js";

/**
 * Create a fully configured Fastify application that exposes the four FIMS SSO routes:
 *
 * - `GET /fauth`         — Redirect to FIMS OIDC provider
 * - `GET /fcb`           — FIMS callback: create session, redirect to /authorize
 * - `GET /authorize`     — Exchange one-time session ID for durable token
 * - `POST /test-session` — Create a session for test users (guarded by TEST_USERS)
 *
 * Callers only need to call `.listen()` on the returned instance.
 * Fastify is a direct dependency of this package so apps do not need to install it.
 */
export const createFimsApp = (
  fimsAuthFlow: FimsAuthFlow,
  options: FastifyServerOptions = {},
): FastifyInstance => {
  const fastify = Fastify(options);

  // -----------------------------------------------------------------------
  // GET /fauth — initiate FIMS authentication
  // -----------------------------------------------------------------------
  fastify.get<{ Querystring: { device?: string } }>(
    "/fauth",
    async (
      request: FastifyRequest<{ Querystring: { device?: string } }>,
      reply: FastifyReply,
    ) => {
      const queryResult = z
        .object({ device: z.string().optional() })
        .safeParse(request.query);
      if (!queryResult.success) {
        return sendErrorResponse(
          reply,
          new ValidationError(queryResult.error.message),
        );
      }

      const result = await fimsAuthFlow.initiateAuth({
        device: queryResult.data.device,
      });
      if (result.isErr()) return sendErrorResponse(reply, result.error);
      return reply.redirect(result.value, 302);
    },
  );

  // -----------------------------------------------------------------------
  // GET /fcb — FIMS callback from identity provider
  // -----------------------------------------------------------------------
  fastify.get<{
    Headers: { signature?: string; "signature-input"?: string };
    Querystring: { code: string; iss: string; state: string };
  }>(
    "/fcb",
    async (
      request: FastifyRequest<{
        Headers: { signature?: string; "signature-input"?: string };
        Querystring: { code: string; iss: string; state: string };
      }>,
      reply: FastifyReply,
    ) => {
      const queryResult = z
        .object({
          code: z.string().min(1),
          iss: z.string().min(1),
          state: z.string().min(1),
        })
        .safeParse(request.query);
      if (!queryResult.success) {
        return sendErrorResponse(
          reply,
          new ValidationError(queryResult.error.message),
        );
      }

      const { code, iss, state } = queryResult.data;
      const { signature, "signature-input": signatureInput } = request.headers;
      const lollipopHeaders =
        typeof signature === "string" && typeof signatureInput === "string"
          ? { signature, "signature-input": signatureInput }
          : undefined;

      const result = await fimsAuthFlow.handleCallback({
        code,
        iss,
        lollipopHeaders,
        state,
      });
      if (result.isErr()) return sendErrorResponse(reply, result.error);
      return reply.redirect(result.value, 302);
    },
  );

  // -----------------------------------------------------------------------
  // GET /authorize — exchange one-time session ID for durable token
  // -----------------------------------------------------------------------
  fastify.get<{ Querystring: { id: string } }>(
    "/authorize",
    async (
      request: FastifyRequest<{ Querystring: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const queryResult = z
        .object({ id: z.string().min(1) })
        .safeParse(request.query);
      if (!queryResult.success) {
        return sendErrorResponse(
          reply,
          new ValidationError(queryResult.error.message),
        );
      }

      const result = await fimsAuthFlow.exchangeSessionId({
        sessionId: queryResult.data.id,
      });
      if (result.isErr()) return sendErrorResponse(reply, result.error);
      return reply.code(200).send(result.value);
    },
  );

  // -----------------------------------------------------------------------
  // POST /test-session — create session for test users (public but guarded)
  // -----------------------------------------------------------------------
  fastify.post<{
    Body: { familyName: string; fiscalCode: string; givenName: string };
  }>(
    "/test-session",
    async (
      request: FastifyRequest<{
        Body: {
          familyName: string;
          fiscalCode: string;
          givenName: string;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const queryResult = z
        .object({
          familyName: z.string().min(1),
          fiscalCode: z.string().min(1),
          givenName: z.string().min(1),
        })
        .safeParse(request.body);
      if (!queryResult.success) {
        return sendErrorResponse(
          reply,
          new ValidationError(queryResult.error.message),
        );
      }

      const { familyName, fiscalCode, givenName } = queryResult.data;
      const result = await fimsAuthFlow.createTestSession({
        familyName,
        fiscalCode,
        givenName,
      });
      if (result.isErr()) return sendErrorResponse(reply, result.error);
      return reply.redirect(result.value, 302);
    },
  );

  return fastify;
};
