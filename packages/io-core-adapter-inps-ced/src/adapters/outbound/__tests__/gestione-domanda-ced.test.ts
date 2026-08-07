import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted before imports — mock the generated endpoint module so
// the adapter under test never makes real HTTP calls.
vi.mock("../../../generated/endpoints/domanda/domanda.js", () => ({
  checkDomanda: vi.fn(),
  confermaDomanda: vi.fn(),
  fornisciFoto: vi.fn(),
  nuovaDomandaInBozza: vi.fn(),
  recuperoDatiDomanda: vi.fn(),
  richiediRicevuta: vi.fn(),
  richiediRiepilogo: vi.fn(),
  richiediStato: vi.fn(),
}));

import {
  checkDomanda as checkDomandaGen,
  nuovaDomandaInBozza as nuovaDomandaInBozzaGen,
  recuperoDatiDomanda as recuperoDatiDomandaGen,
} from "../../../generated/endpoints/domanda/domanda.js";
import { createGestioneDomandaCedClient } from "../gestione-domanda-ced.js";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

// Loose response builder — cast bypasses the narrow discriminated-union type
// so we can freely vary the status code in tests.
function makeGenResponse(status: number, data: unknown) {
  return { data, headers: new Headers(), status } as ReturnType<
    typeof checkDomandaGen
  > extends Promise<infer R>
    ? R
    : never;
}

const adapter = createGestioneDomandaCedClient();

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// checkDomanda — covers all status-code branches + throw + identity fallback
// ─────────────────────────────────────────────────────────────────────────────
describe("checkDomanda", () => {
  it("returns ok(data) on 200", async () => {
    const data = { esitoCheck: 10, idLavorazione: null };
    vi.mocked(checkDomandaGen).mockResolvedValue(makeGenResponse(200, data));

    const result = await adapter.checkDomanda({
      codiceFiscale: "RSSMRA80A01H501U",
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(NotFoundError) on 404", async () => {
    vi.mocked(checkDomandaGen).mockResolvedValue(
      makeGenResponse(404, { detail: "not found" }),
    );

    const result = await adapter.checkDomanda({ codiceFiscale: null });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("NotFoundError");
  });

  it("returns err(GenericError) on unexpected status", async () => {
    vi.mocked(checkDomandaGen).mockResolvedValue(
      makeGenResponse(500, { detail: "internal error" }),
    );

    const result = await adapter.checkDomanda({ codiceFiscale: null });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });

  it("returns err(GenericError) when the generated function throws", async () => {
    vi.mocked(checkDomandaGen).mockRejectedValue(new Error("network failure"));

    const result = await adapter.checkDomanda({ codiceFiscale: null });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// nuovaDomandaInBozza — covers idempotency key forwarding + 400 branch
// ─────────────────────────────────────────────────────────────────────────────
describe("nuovaDomandaInBozza", () => {
  // Use a minimal typed stub for the request — the mock ignores the body.
  const BOZZA_REQUEST = {
    anagrafica: {},
    informativaPrivacy: true,
    recapito: {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  it("returns ok(data) on 200", async () => {
    const data = { idLavorazione: "12345678901234567890" };
    vi.mocked(nuovaDomandaInBozzaGen).mockResolvedValue(
      makeGenResponse(200, data),
    );

    const result = await adapter.nuovaDomandaInBozza(BOZZA_REQUEST, {
      idempotencyKey: "key-1",
    });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(ValidationError) on 400", async () => {
    vi.mocked(nuovaDomandaInBozzaGen).mockResolvedValue(
      makeGenResponse(400, { detail: "invalid input" }),
    );

    const result = await adapter.nuovaDomandaInBozza(BOZZA_REQUEST, {
      idempotencyKey: "key-1",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ValidationError");
  });

  it("passes the idempotency key in the Idempotency-Key header", async () => {
    vi.mocked(nuovaDomandaInBozzaGen).mockResolvedValue(
      makeGenResponse(200, {}),
    );

    await adapter.nuovaDomandaInBozza(BOZZA_REQUEST, {
      idempotencyKey: "test-idempotency-abc",
    });

    const [, callOptions] = vi.mocked(nuovaDomandaInBozzaGen).mock.calls[0] as [
      unknown,
      RequestInit & { headers?: Record<string, string> },
    ];
    expect(callOptions?.headers?.["Idempotency-Key"]).toBe(
      "test-idempotency-abc",
    );
  });
});

describe("recuperoDatiDomanda", () => {
  const request = {
    codiceFiscale: "RSSMRA80A01H501U",
    idLavorazione: "12345678901234567890",
  };

  it("returns ok(data) on 200", async () => {
    const data = { anagrafica: {}, recapito: {} };
    vi.mocked(recuperoDatiDomandaGen).mockResolvedValue(
      makeGenResponse(200, data),
    );

    const result = await adapter.recuperoDatiDomanda(request);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(data);
  });

  it("returns err(ValidationError) on 400", async () => {
    vi.mocked(recuperoDatiDomandaGen).mockResolvedValue(
      makeGenResponse(400, { detail: "state not coherent" }),
    );

    const result = await adapter.recuperoDatiDomanda(request);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("ValidationError");
  });
});
