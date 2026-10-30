import { describe, expect, it } from "vitest";

import { SupportContactInputSchema } from "../support-contact-input.schema.js";

describe("SupportContactInputSchema", () => {
  it.each([
    { type: "email", value: "assistenza@example.it" },
    { type: "email", value: " nome.cognome+support@example.it " },
    { type: "phone", value: "0212345678" },
    { type: "phone", value: "+39 02 1234 5678" },
    { type: "phone", value: "+39(02)12345678" },
    { type: "website", value: "https://www.example.it/assistenza" },
    { type: "website", value: " https://example.it " },
  ] as const)("accepts valid $type contacts", (contact) => {
    expect(SupportContactInputSchema.safeParse(contact).success).toBe(true);
  });

  it.each([
    { type: "email", value: "not-an-email" },
    { type: "email", value: "utente@-example.it" },
    { type: "phone", value: "+39 02 abc123" },
    { type: "phone", value: "((02))12345678" },
    { type: "website", value: "http://example.it" },
    { type: "website", value: "www.example.it" },
    { type: "email", value: "" },
    { type: "phone", value: "   " },
  ] as const)("rejects invalid $type contacts", (contact) => {
    expect(SupportContactInputSchema.safeParse(contact).success).toBe(false);
  });

  it("normalizes whitespace around a valid contact", () => {
    expect(
      SupportContactInputSchema.parse({
        type: "email",
        value: " support@example.it ",
      }),
    ).toEqual({ type: "email", value: "support@example.it" });
  });
});
