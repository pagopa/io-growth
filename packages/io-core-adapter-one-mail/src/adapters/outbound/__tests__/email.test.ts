import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted before imports — mock the generated endpoint module so
// the adapter under test never makes real HTTP calls.
vi.mock("../../../generated/endpoints/emails/emails.js", () => ({
  getGetV1EmailsStatusesUrl: vi.fn(
    (params: { requestId: string }) =>
      `/v1/emails/statuses?requestId=${params.requestId}`,
  ),
  getPostV1EmailsSanitizeHtmlUrl: vi.fn(() => "/v1/emails/sanitize-html"),
  getPostV1EmailsSendHighUrl: vi.fn(() => "/v1/emails/send/high"),
  getPostV1EmailsSendLowUrl: vi.fn(() => "/v1/emails/send/low"),
}));

import { createEmailClient } from "../email.js";

// Loose response builder — cast bypasses the narrow discriminated-union
// response type so tests can freely vary the status code.
function makeResponse<T>(status: number, data: T) {
  return { data, headers: new Headers(), status } as {
    data: T;
    headers: Headers;
    status: number;
  };
}

const customFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getEmailStatuses", () => {
  it("returns ok(data) on 200", async () => {
    const data = [{ attempts: 1, emailId: "id-1" }];
    customFetch.mockResolvedValue(makeResponse(200, data));

    const adapter = createEmailClient(customFetch);
    const result = await adapter.getEmailStatuses("req-1");

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(NotFoundError) on 404", async () => {
    customFetch.mockResolvedValue(
      makeResponse(404, { message: "not found", timestamp: "now" }),
    );

    const adapter = createEmailClient(customFetch);
    const result = await adapter.getEmailStatuses("req-1");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("NotFoundError");
  });

  it("returns err(GenericError) when customFetch throws", async () => {
    customFetch.mockRejectedValue(new Error("network down"));

    const adapter = createEmailClient(customFetch);
    const result = await adapter.getEmailStatuses("req-1");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});

describe("sanitizeHtml", () => {
  it("returns ok(data) on 200", async () => {
    const data = { isSanitized: true, sanitizedHtml: "<p>hi</p>" };
    customFetch.mockResolvedValue(makeResponse(200, data));

    const adapter = createEmailClient(customFetch);
    const result = await adapter.sanitizeHtml({ htmlContent: "<p>hi</p>" });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(ValidationError) on 400", async () => {
    customFetch.mockResolvedValue(
      makeResponse(400, { message: "invalid", timestamp: "now" }),
    );

    const adapter = createEmailClient(customFetch);
    const result = await adapter.sanitizeHtml({ htmlContent: "" });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ValidationError");
  });
});

describe("sendHighPriorityEmail", () => {
  const body = {
    from: { email: "sender@example.com" },
    to: { email: "recipient@example.com" },
  };

  it("returns ok(data) on 202 and calls onEmailSent", async () => {
    const data = { requestId: "req-1" };
    customFetch.mockResolvedValue(makeResponse(202, data));
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const adapter = createEmailClient(customFetch, {
      onEmailError,
      onEmailSent,
    });
    const result = await adapter.sendHighPriorityEmail(body as never);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
    expect(onEmailSent).toHaveBeenCalledWith({
      priority: "high",
      requestId: "req-1",
    });
    expect(onEmailError).not.toHaveBeenCalled();
  });

  it("returns err(ForbiddenError) on 403 and calls onEmailError", async () => {
    customFetch.mockResolvedValue(
      makeResponse(403, { message: "forbidden", timestamp: "now" }),
    );
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const adapter = createEmailClient(customFetch, {
      onEmailError,
      onEmailSent,
    });
    const result = await adapter.sendHighPriorityEmail(body as never);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ForbiddenError");
    expect(onEmailSent).not.toHaveBeenCalled();
    expect(onEmailError).toHaveBeenCalledOnce();
  });

  it("returns err(GenericError) and calls onEmailError when customFetch throws", async () => {
    customFetch.mockRejectedValue(new Error("network down"));
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const adapter = createEmailClient(customFetch, {
      onEmailError,
      onEmailSent,
    });
    const result = await adapter.sendHighPriorityEmail(body as never);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(onEmailError).toHaveBeenCalledOnce();
  });

  it("works without onEmailSent/onEmailError", async () => {
    customFetch.mockResolvedValue(makeResponse(202, { requestId: "req-1" }));

    const adapter = createEmailClient(customFetch);
    const result = await adapter.sendHighPriorityEmail(body as never);

    expect(result.isOk()).toBe(true);
  });
});

describe("sendLowPriorityEmail", () => {
  const body = {
    from: { email: "sender@example.com" },
    sendingInfo: [{ to: { email: "recipient@example.com" } }],
    templateId: "template-1",
  };

  it("returns ok(data) on 202 and calls onEmailSent", async () => {
    const data = { requestId: "req-2" };
    customFetch.mockResolvedValue(makeResponse(202, data));
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const adapter = createEmailClient(customFetch, {
      onEmailError,
      onEmailSent,
    });
    const result = await adapter.sendLowPriorityEmail(body as never);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
    expect(onEmailSent).toHaveBeenCalledWith({
      priority: "low",
      requestId: "req-2",
    });
  });

  it("returns err(ConflictError) on 409 and calls onEmailError", async () => {
    customFetch.mockResolvedValue(
      makeResponse(409, { message: "conflict", timestamp: "now" }),
    );
    const onEmailSent = vi.fn();
    const onEmailError = vi.fn();

    const adapter = createEmailClient(customFetch, {
      onEmailError,
      onEmailSent,
    });
    const result = await adapter.sendLowPriorityEmail(body as never);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ConflictError");
    expect(onEmailError).toHaveBeenCalledOnce();
  });

  it("returns err(GenericError) on an unmapped status", async () => {
    customFetch.mockResolvedValue(
      makeResponse(500, { message: "boom", timestamp: "now" }),
    );

    const adapter = createEmailClient(customFetch);
    const result = await adapter.sendLowPriorityEmail(body as never);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});
