import { describe, expect, it } from "vitest";

import { createAuditStorage } from "../audit-context.js";

const { runWith, transactionAuditData: storage } = createAuditStorage<{
  readonly id: string;
}>();

describe("storage", () => {
  it("returns undefined when accessed outside runWith", () => {
    expect(storage.getStore()).toBeUndefined();
  });
});

describe("runWith", () => {
  it("makes the context available inside the callback", async () => {
    const context = { id: "test-1" };
    let captured: undefined | { readonly id: string };

    await runWith(context, async () => {
      captured = storage.getStore();
    });

    expect(captured).toEqual(context);
  });

  it("does not leak context outside the callback", async () => {
    const context = { id: "test-2" };
    await runWith(context, async () => {});
    expect(storage.getStore()).toBeUndefined();
  });

  it("isolates nested contexts", async () => {
    const outer = { id: "outer" };
    const inner = { id: "inner" };
    let capturedInner: undefined | { readonly id: string };

    await runWith(outer, async () => {
      await runWith(inner, async () => {
        capturedInner = storage.getStore();
      });
      // outer context is restored after inner finishes
      expect(storage.getStore()).toEqual(outer);
    });

    expect(capturedInner).toEqual(inner);
  });
});
