import { afterEach, describe, expect, it, vi } from "vitest";

import { createOneMailClient } from "../client.js";

const config = {
  apiKey: "api-key",
  baseUrl: "https://onemail.example.com",
};

describe("createOneMailClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes the email and health outbound clients", () => {
    const client = createOneMailClient(config);

    expect(client.emailClient).toBeDefined();
    expect(client.healthClient).toBeDefined();
  });

  it("forwards onEmailSent/onEmailError to the email client only", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ requestId: "req-1" }), {
        headers: { "content-type": "application/json" },
        status: 202,
      }),
    );
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const client = createOneMailClient({
      ...config,
      onEmailError,
      onEmailSent,
    });
    await client.emailClient.sendHighPriorityEmail({
      from: { email: "a@example.com" },
      to: { email: "b@example.com" },
    } as never);

    expect(onEmailSent).toHaveBeenCalledOnce();
    expect(onEmailError).not.toHaveBeenCalled();
  });
});
