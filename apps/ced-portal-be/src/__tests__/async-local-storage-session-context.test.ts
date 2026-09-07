import { describe, expect, it } from "vitest";

import type { Session } from "../domain/entities/session.js";

import {
  createSessionContext,
  getRequestSession,
} from "../async-local-storage-session-context.js";

const testSession: Session = {
  firstName: "Mario",
  lastName: "Rossi",
  operatorExternalId: "org-ext-1",
  operatorName: "Ente Demo",
  referentExternalId: "ref-1",
  role: "security",
  userType: "test_operator",
};

describe("createSessionContext", () => {
  it("returns undefined outside of any session context", () => {
    expect(getRequestSession()).toBeUndefined();
  });

  it("makes the session available via getRequestSession() inside the callback", () => {
    const observed = createSessionContext(testSession, () =>
      getRequestSession(),
    );

    expect(observed).toEqual(testSession);
  });

  it("returns the callback's return value", () => {
    const result = createSessionContext(testSession, () => 42);

    expect(result).toBe(42);
  });

  it("does not leak the session outside of the callback", () => {
    createSessionContext(testSession, () => undefined);

    expect(getRequestSession()).toBeUndefined();
  });

  it("propagates the session to async continuations started inside the callback", async () => {
    // Mirrors how a routed repository call (Promise-based) resolves after the
    // synchronous callback frame returns, e.g. operatorRepository.getByExternalId(...).
    const observed = await createSessionContext(testSession, () =>
      Promise.resolve().then(() => getRequestSession()),
    );

    expect(observed).toEqual(testSession);
  });

  it("isolates concurrent session contexts from one another", async () => {
    const prodSession: Session = { ...testSession, userType: "operator" };

    const [testResult, prodResult] = await Promise.all([
      createSessionContext(testSession, () =>
        Promise.resolve().then(() => getRequestSession()?.userType),
      ),
      createSessionContext(prodSession, () =>
        Promise.resolve().then(() => getRequestSession()?.userType),
      ),
    ]);

    expect(testResult).toBe("test_operator");
    expect(prodResult).toBe("operator");
  });
});
