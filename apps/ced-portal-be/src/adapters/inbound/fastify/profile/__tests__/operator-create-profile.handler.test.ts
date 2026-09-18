import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
  multipart,
} from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorCreateProfileUseCase } from "../../../../../application/use-cases/profile/operator-create-profile.use-case.js";
import type { Session } from "../../../../../domain/entities/session.js";

import { mockProfile } from "../../../../../application/use-cases/profile/__tests__/mocks.js";
import { createSessionContextPreHandler } from "../../../../../async-local-storage-session-context.js";
import { SessionSchema } from "../../auth/session.js";
import { mountOperatorCreateProfileHandler } from "../operator-create-profile.handler.js";

const OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
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
  const boundary = "profile-upload-boundary";
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

const baseSession: Session = {
  firstName: "Luca",
  lastName: "Bianchi",
  operatorExternalId: "",
  operatorId: OPERATOR_ID,
  operatorName: "",
  referentExternalId: "",
  role: "security",
  userType: "operator",
};

describe("mountOperatorCreateProfileHandler", () => {
  it("parses the profile JSON part and both files", async () => {
    const useCase: OperatorCreateProfileUseCase = vi
      .fn()
      .mockResolvedValue(ok(mockProfile));
    const app = buildApp(baseSession);
    mountOperatorCreateProfileHandler(app, useCase);
    const form = multipartPayload([
      {
        content: JSON.stringify(profile),
        contentType: "application/json",
        name: "profile",
      },
      {
        content: ONE_PIXEL_PNG,
        contentType: "image/png",
        filename: "logo.png",
        name: "logo",
      },
      {
        content: ONE_PIXEL_PNG,
        contentType: "image/png",
        filename: "image.png",
        name: "image",
      },
    ]);

    const response = await app.inject({
      headers: {
        authorization: "Bearer ******",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "POST",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(201);
    expect(useCase).toHaveBeenCalledWith({
      contactEmail: profile.contactEmail,
      displayName: profile.displayName,
      image: expect.any(Blob),
      logo: expect.any(Blob),
      operatorId: OPERATOR_ID,
      place: profile.place,
    });
  });

  it.each([
    [
      "profile",
      [
        {
          content: ONE_PIXEL_PNG,
          contentType: "image/png",
          filename: "logo.png",
          name: "logo",
        },
        {
          content: ONE_PIXEL_PNG,
          contentType: "image/png",
          filename: "image.png",
          name: "image",
        },
      ],
    ],
    [
      "image",
      [
        {
          content: JSON.stringify(profile),
          contentType: "application/json",
          name: "profile",
        },
        {
          content: ONE_PIXEL_PNG,
          contentType: "image/png",
          filename: "logo.png",
          name: "logo",
        },
      ],
    ],
  ])("returns 400 when the %s part is missing", async (_missing, parts) => {
    const useCase: OperatorCreateProfileUseCase = vi.fn();
    const app = buildApp(baseSession);
    mountOperatorCreateProfileHandler(app, useCase);
    const form = multipartPayload(parts);

    const response = await app.inject({
      headers: {
        authorization: "Bearer ******",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "POST",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });

  it("returns 400 when the profile part is not valid JSON", async () => {
    const useCase: OperatorCreateProfileUseCase = vi.fn();
    const app = buildApp(baseSession);
    mountOperatorCreateProfileHandler(app, useCase);
    const form = multipartPayload([
      {
        content: "{invalid",
        contentType: "application/json",
        name: "profile",
      },
      {
        content: ONE_PIXEL_PNG,
        contentType: "image/png",
        filename: "logo.png",
        name: "logo",
      },
      {
        content: ONE_PIXEL_PNG,
        contentType: "image/png",
        filename: "image.png",
        name: "image",
      },
    ]);

    const response = await app.inject({
      headers: {
        authorization: "Bearer ******",
        "content-type": `multipart/form-data; boundary=${form.boundary}`,
      },
      method: "POST",
      payload: form.payload,
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(400);
    expect(useCase).not.toHaveBeenCalled();
  });
});
