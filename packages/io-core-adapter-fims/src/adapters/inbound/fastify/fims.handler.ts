import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { FimsAuthFlow } from "../../../application/use-cases/fims-auth-flow.js";

const initiateAuthHttpSchema = z.object({
  query: z.object({ device: z.string().optional() }),
});

const callbackHttpSchema = z.object({
  headers: z.object({
    signature: z.string().optional(),
    "signature-input": z.string().optional(),
  }),
  query: z.object({
    code: z.string().min(1),
    iss: z.string().min(1),
    state: z.string().min(1),
  }),
});

const authorizeHttpSchema = z.object({
  query: z.object({ id: z.string().min(1) }),
});

const testSessionHttpSchema = z.object({
  body: z.object({
    familyName: z.string().min(1),
    fiscalCode: z.string().min(1),
    givenName: z.string().min(1),
  }),
});

type AuthorizeInput = z.infer<typeof authorizeHttpSchema>;
type CallbackInput = z.infer<typeof callbackHttpSchema>;
type InitiateAuthInput = z.infer<typeof initiateAuthHttpSchema>;
type TestSessionInput = z.infer<typeof testSessionHttpSchema>;

/**
 * Mount FIMS SSO routes on an existing Fastify instance:
 *
 * - `GET /api/fauth`         — Redirect to FIMS OIDC provider
 * - `GET /api/fcb`           — FIMS callback: create session, redirect to /api/authorize
 * - `GET /api/authorize`     — Exchange one-time session ID for durable token
 * - `POST /api/test-session` — Create a session for test users (guarded by TEST_USERS)
 *
 * The Fastify instance is provided by the consuming app (injected).
 */
export const mountFimsHandlers = (
  fastify: FastifyInstance,
  fimsAuthFlow: FimsAuthFlow,
): void => {
  // GET /api/fauth — initiate FIMS authentication
  fastify.get(
    "/api/fauth",
    createHttpHandler(
      async ({ query }: InitiateAuthInput) =>
        fimsAuthFlow.initiateAuth({ device: query.device }),
      createHttpRequestValidator(initiateAuthHttpSchema),
      { redirect: true, redirectCode: 302, redirectUrlBuilder: (url) => url },
    ),
  );

  // GET /api/fcb — FIMS callback from identity provider
  fastify.get(
    "/api/fcb",
    createHttpHandler(
      async ({ headers, query }: CallbackInput) => {
        const lollipopHeaders =
          typeof headers.signature === "string" &&
          typeof headers["signature-input"] === "string"
            ? {
                signature: headers.signature,
                "signature-input": headers["signature-input"],
              }
            : undefined;

        return fimsAuthFlow.handleCallback({
          code: query.code,
          iss: query.iss,
          lollipopHeaders,
          state: query.state,
        });
      },
      createHttpRequestValidator(callbackHttpSchema),
      { redirect: true, redirectCode: 302, redirectUrlBuilder: (url) => url },
    ),
  );

  // GET /api/authorize — exchange one-time session ID for durable token
  fastify.get(
    "/api/authorize",
    createHttpHandler(
      async ({ query }: AuthorizeInput) =>
        fimsAuthFlow.exchangeSessionId({ sessionId: query.id }),
      createHttpRequestValidator(authorizeHttpSchema),
      { successCode: 200 },
    ),
  );

  // POST /api/test-session — create session for test users (public but guarded)
  fastify.post(
    "/api/test-session",
    createHttpHandler(
      async ({ body }: TestSessionInput) =>
        fimsAuthFlow.createTestSession(body),
      createHttpRequestValidator(testSessionHttpSchema),
      { redirect: true, redirectCode: 302, redirectUrlBuilder: (url) => url },
    ),
  );
};
