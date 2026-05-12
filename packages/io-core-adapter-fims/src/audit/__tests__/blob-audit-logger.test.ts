import { GenericError } from "@pagopa/io-core-domain/errors";
import { describe, expect, it, vi } from "vitest";

import { createBlobAuditLogger } from "../blob-audit-logger.js";

// Minimal mock for ContainerClient: we only need getBlockBlobClient().upload()
const buildMockContainerClient = (uploadResult: {
  _response: { status: number };
}) => {
  const upload = vi.fn().mockResolvedValue(uploadResult);
  const getBlockBlobClient = vi.fn().mockReturnValue({ upload });
  return {
    containerClient: { getBlockBlobClient } as never,
    getBlockBlobClient,
    upload,
  };
};

const FIMS_AUDIT = { authCode: "code-abc", fiscalCode: "RSSMRA80A01H501T" };
const LOLLIPOP_AUDIT = {
  assertion: "<saml/>",
  assertionRef: "sha256-abc",
  fiscalCode: "RSSMRA80A01H501T",
  publicKey: "eyJrdHkiOiJFQyJ9",
};

describe("createBlobAuditLogger.logFimsExchange", () => {
  it("returns ok(void) when upload succeeds (status 201)", async () => {
    const { containerClient } = buildMockContainerClient({
      _response: { status: 201 },
    });
    const logger = createBlobAuditLogger(containerClient);

    const result = await logger.logFimsExchange(FIMS_AUDIT);

    expect(result.isOk()).toBe(true);
  });

  it("returns GenericError when upload returns status >= 300", async () => {
    const { containerClient } = buildMockContainerClient({
      _response: { status: 500 },
    });
    const logger = createBlobAuditLogger(containerClient);

    const result = await logger.logFimsExchange(FIMS_AUDIT);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(GenericError);
  });

  it("returns GenericError when upload throws", async () => {
    const upload = vi.fn().mockRejectedValue(new Error("network error"));
    const containerClient = {
      getBlockBlobClient: vi.fn().mockReturnValue({ upload }),
    } as never;
    const logger = createBlobAuditLogger(containerClient);

    const result = await logger.logFimsExchange(FIMS_AUDIT);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(GenericError);
  });

  it("creates blob with correct content and fims tags", async () => {
    const { containerClient, getBlockBlobClient, upload } =
      buildMockContainerClient({ _response: { status: 201 } });
    const logger = createBlobAuditLogger(containerClient);

    await logger.logFimsExchange(FIMS_AUDIT);

    expect(getBlockBlobClient).toHaveBeenCalledOnce();
    // Blob name contains the hashed fiscal code and "fims" type
    const blobName: string = getBlockBlobClient.mock.calls[0][0] as string;
    expect(blobName).toContain("fims");

    const [content, , opts] = upload.mock.calls[0] as [
      string,
      number,
      { tags: Record<string, string> },
    ];
    const parsed = JSON.parse(content) as {
      authCode: string;
      fiscalCode: string;
    };
    expect(parsed.authCode).toBe("code-abc");
    expect(opts.tags.Type).toBe("fims");
    expect(opts.tags.FiscalCode).toBe("RSSMRA80A01H501T");
  });
});

describe("createBlobAuditLogger.logLollipopVerification", () => {
  it("returns ok(void) when upload succeeds", async () => {
    const { containerClient } = buildMockContainerClient({
      _response: { status: 201 },
    });
    const logger = createBlobAuditLogger(containerClient);

    const result = await logger.logLollipopVerification(LOLLIPOP_AUDIT);

    expect(result.isOk()).toBe(true);
  });

  it("creates blob with lollipop tags and content", async () => {
    const { containerClient, getBlockBlobClient, upload } =
      buildMockContainerClient({ _response: { status: 201 } });
    const logger = createBlobAuditLogger(containerClient);

    await logger.logLollipopVerification(LOLLIPOP_AUDIT);

    const blobName: string = getBlockBlobClient.mock.calls[0][0] as string;
    expect(blobName).toContain("lollipop");

    const [content, , opts] = upload.mock.calls[0] as [
      string,
      number,
      { tags: Record<string, string> },
    ];
    const parsed = JSON.parse(content) as { assertionRef: string };
    expect(parsed.assertionRef).toBe("sha256-abc");
    expect(opts.tags.Type).toBe("lollipop");
  });
});
