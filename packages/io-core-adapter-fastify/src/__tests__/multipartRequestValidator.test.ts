import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createMultipartRequestValidator } from "../validator/multipartRequestValidator.js";

const BOUNDARY = "test-boundary";

const BodySchema = z.object({
  file: z.instanceof(File),
  profile: z.object({ displayName: z.string() }),
});

const buildPayload = (
  parts: readonly {
    readonly content: Buffer | string;
    readonly contentType?: string;
    readonly filename?: string;
    readonly name: string;
  }[],
) =>
  Buffer.concat([
    ...parts.flatMap(({ content, contentType, filename, name }) => {
      const disposition = filename
        ? `Content-Disposition: form-data; name="${name}"; filename="${filename}"`
        : `Content-Disposition: form-data; name="${name}"`;

      return [
        Buffer.from(
          [
            `--${BOUNDARY}`,
            disposition,
            ...(contentType ? [`Content-Type: ${contentType}`] : []),
            "",
            "",
          ].join("\r\n"),
        ),
        Buffer.from(content),
        Buffer.from("\r\n"),
      ];
    }),
    Buffer.from(`--${BOUNDARY}--\r\n`),
  ]);

const inject = async (
  payload: Buffer | string,
  contentType = `multipart/form-data; boundary=${BOUNDARY}`,
) => {
  const app = Fastify();
  await app.register(multipart);

  const validator = createMultipartRequestValidator(BodySchema);

  app.post("/", async (request, reply) => {
    const result = await validator(request);

    return result.isErr()
      ? reply.status(400).send({ message: result.error.message })
      : reply.status(200).send({
          displayName: result.value.profile.displayName,
          fileName: result.value.file.name,
          fileType: result.value.file.type,
        });
  });

  return app.inject({
    headers: { "content-type": contentType },
    method: "POST",
    payload,
    url: "/",
  });
};

describe("createMultipartRequestValidator", () => {
  it("collects file parts as File and JSON parts as parsed values", async () => {
    const response = await inject(
      buildPayload([
        {
          content: JSON.stringify({ displayName: "Operatore Demo" }),
          contentType: "application/json",
          name: "profile",
        },
        {
          content: "binary-content",
          contentType: "image/png",
          filename: "logo.png",
          name: "file",
        },
      ]),
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      displayName: "Operatore Demo",
      fileName: "logo.png",
      fileType: "image/png",
    });
  });

  it("rejects non-multipart requests", async () => {
    const response = await inject("{}", "application/json");

    expect(response.statusCode).toBe(400);
  });

  it("rejects a malformed JSON part", async () => {
    const response = await inject(
      buildPayload([
        {
          content: "{invalid",
          contentType: "application/json",
          name: "profile",
        },
        {
          content: "binary-content",
          contentType: "image/png",
          filename: "logo.png",
          name: "file",
        },
      ]),
    );

    expect(response.statusCode).toBe(400);
  });

  it("rejects a body that does not match the schema", async () => {
    const response = await inject(
      buildPayload([
        {
          content: "binary-content",
          contentType: "image/png",
          filename: "logo.png",
          name: "file",
        },
      ]),
    );

    expect(response.statusCode).toBe(400);
  });
});
