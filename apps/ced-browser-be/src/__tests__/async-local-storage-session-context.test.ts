import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import Fastify from "fastify";
import { err, ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import type { CitizenSession } from "../async-local-storage-session-context.js";

import {
  createSessionContextPreHandler,
  getRequestSession,
} from "../async-local-storage-session-context.js";

const session: CitizenSession = {
  familyName: "Rossi",
  fiscalCode: "RSSMRA80A01H501U",
  givenName: "Mario",
};

describe("createSessionContextPreHandler", () => {
  it("returns undefined outside of any request", () => {
    expect(getRequestSession()).toBeUndefined();
  });

  it("exposes the session to the handler, including async continuations", async () => {
    const app = Fastify();
    app.addHook(
      "preHandler",
      createSessionContextPreHandler(() => Promise.resolve(ok(session))),
    );
    app.get("/", async () => {
      await Promise.resolve();
      return { session: getRequestSession() };
    });

    const response = await app.inject({ method: "GET", url: "/" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ session });
    expect(getRequestSession()).toBeUndefined();
  });

  it("isolates concurrent requests", async () => {
    const app = Fastify();
    app.addHook(
      "preHandler",
      createSessionContextPreHandler((req) =>
        Promise.resolve(
          ok({ ...session, fiscalCode: String(req.headers["x-fc"]) }),
        ),
      ),
    );
    app.get("/", async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { fiscalCode: getRequestSession()?.fiscalCode };
    });

    const [a, b] = await Promise.all([
      app.inject({ headers: { "x-fc": "A" }, method: "GET", url: "/" }),
      app.inject({ headers: { "x-fc": "B" }, method: "GET", url: "/" }),
    ]);

    expect(a.json()).toEqual({ fiscalCode: "A" });
    expect(b.json()).toEqual({ fiscalCode: "B" });
  });

  it("replies 401 when the session cannot be resolved", async () => {
    const app = Fastify();
    app.addHook(
      "preHandler",
      createSessionContextPreHandler(() =>
        Promise.resolve(err(new UnauthorizedError("no session"))),
      ),
    );
    app.get("/", () => ({ ok: true }));

    const response = await app.inject({ method: "GET", url: "/" });

    expect(response.statusCode).toBe(401);
  });
});
