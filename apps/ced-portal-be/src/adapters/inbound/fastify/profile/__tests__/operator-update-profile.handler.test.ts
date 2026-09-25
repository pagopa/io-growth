import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
  multipart,
} from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorUpdateProfileUseCase } from "../../../../../application/use-cases/profile/operator-update-profile.use-case.js";
import type { Session } from "../../../../../domain/entities/session.js";

import {
  MOCK_OPERATOR_ID,
  mockProfile,
} from "../../../../../application/use-cases/profile/__tests__/mocks.js";
import { createSessionContextPreHandler } from "../../../../../async-local-storage-session-context.js";
import { SessionSchema } from "../../auth/session.js";
import { mountOperatorUpdateProfileHandler } from "../operator-update-profile.handler.js";

const profile = {
  contactEmail: "contatto@example.org",
  displayName: "Operatore Demo",
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email", value: "support@example.org" }],
    type: "online",
    website: { url: "https://example.org" },
  },
};

const multipartPayload = (
  parts: readonly {
    readonly content: Buffer | string;
    readonly contentType?: string;
    readonly filename?: string;
    readonly name: string;
  }[],
) => {
  const boundary = "profile-update-boundary";
  const payload = Buffer.concat(
    parts.flatMap(({ content, contentType, filename, name }) => {
      const disposition = filename
        ? `Content-Disposition: form-data; name="${name}"; filename="${filename}"`
        : `Content-Disposition: form-data; name="${name}"`;
      const headers = [
        `--${boundary}`,
        disposition,
        ...(contentType ? [`Content-Type: ${contentType}`] : []),
        "",
        "",
      ].join("\r\n");
      return [Buffer.from(headers), Buffer.from(content), Buffer.from("\r\n")];
    }),
  );

  return {
    boundary,
    payload: Buffer.concat([payload, Buffer.from(`--${boundary}--\r\n`)]),
  };
};

const buildApp = (session: Session) => {
  const app = Fastify();
  const resolver = vi.fn().mockResolvedValue(ok(session));

  app.register(multipart);
  app.addHook("preHandler", createAuthenticationPreHandler(resolver));
  app.addHook(
    "preHandler",
    createSessionContextPreHandler((request) =>
      getSessionFromRequest(request, SessionSchema),
    ),
  );

  return app;
};

const session: Session = {
  firstName: "Luca",
  lastName: "Bianchi",
  operatorExternalId: "",
  operatorId: MOCK_OPERATOR_ID,
  operatorName: "",
  referentExternalId: "",
  role: "security",
  userType: "operator",
};

describe("mountOperatorUpdateProfileHandler", () => {
  it("accepts the complete profile without requiring image files", async () => {
    const useCase: OperatorUpdateProfileUseCase = vi
      .fn()
      .mockResolvedValue(ok(mockProfile));
    const app = buildApp(session);
    mountOperatorUpdateProfileHandler(app, useCase);
    const form = multipartPayload([
      {
        content: JSON.stringify(profile),
        contentType: "application/json",
        name: "profile",
      },
    ]);

    const response = await app.inject({
      headers: {
        authorization: "Bearer test-token",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "PUT",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(200);
    expect(useCase).toHaveBeenCalledWith({
      ...profile,
      image: undefined,
      logo: undefined,
      operatorId: MOCK_OPERATOR_ID,
    });
  });

  it("rejects an incomplete profile", async () => {
    const useCase: OperatorUpdateProfileUseCase = vi.fn();
    const app = buildApp(session);
    mountOperatorUpdateProfileHandler(app, useCase);
    const form = multipartPayload([]);

    const response = await app.inject({
      headers: {
        authorization: "Bearer test-token",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "PUT",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });

  it("rejects unknown profile fields", async () => {
    const useCase: OperatorUpdateProfileUseCase = vi.fn();
    const app = buildApp(session);
    mountOperatorUpdateProfileHandler(app, useCase);
    const form = multipartPayload([
      {
        content: JSON.stringify({ ...profile, operatorId: MOCK_OPERATOR_ID }),
        contentType: "application/json",
        name: "profile",
      },
    ]);

    const response = await app.inject({
      headers: {
        authorization: "Bearer test-token",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "PUT",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });
});
