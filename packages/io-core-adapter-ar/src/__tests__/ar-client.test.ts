import { afterEach, describe, expect, it, vi } from "vitest";

import { createArClient } from "../ar-client.js";

const prodConfig = {
  baseUrl: "https://prod.example.com",
  subscriptionKey: "prod-key",
};
const testConfig = {
  baseUrl: "https://test.example.com",
  subscriptionKey: "test-key",
};

describe("createArClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes the four AR outbound clients", () => {
    const client = createArClient(prodConfig);

    expect(client.documentContentClient).toBeDefined();
    expect(client.institutionClient).toBeDefined();
    expect(client.onboardingClient).toBeDefined();
    expect(client.userClient).toBeDefined();
  });

  it("binds each instance to its own config so prod and test stay isolated", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const prodClient = createArClient(prodConfig);
    const testClient = createArClient(testConfig);

    await prodClient.userClient.getUserById("user-1");
    await testClient.userClient.getUserById("user-1");

    const [prodCall, testCall] = fetchSpy.mock.calls;

    expect(String(prodCall?.[0])).toContain("https://prod.example.com");
    expect(
      (prodCall?.[1]?.headers as Headers).get("Ocp-Apim-Subscription-Key"),
    ).toBe("prod-key");
    expect(String(testCall?.[0])).toContain("https://test.example.com");
    expect(
      (testCall?.[1]?.headers as Headers).get("Ocp-Apim-Subscription-Key"),
    ).toBe("test-key");
  });
});
