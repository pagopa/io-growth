import { HttpsUrlSchema } from "@pagopa/io-core-domain/value-objects";
import { z } from "zod";

const SupportContactValueSchema = z.string().max(2048).trim().min(1);

export const SupportContactEmailValueSchema = SupportContactValueSchema.pipe(
  z.email(),
).refine(
  (value) =>
    !value
      .slice(value.lastIndexOf("@") + 1)
      .split(".")
      .some((label) => label.endsWith("-")),
);

export const SupportContactPhoneValueSchema = SupportContactValueSchema.refine(
  (value) => /^\+?\d+(?:[ .-]\d+)*$/.test(value.replace(/\((\d+)\)/g, "$1")),
);

export const SupportContactWebsiteValueSchema =
  SupportContactValueSchema.pipe(HttpsUrlSchema);

export const SupportContactEmailInputSchema = z.object({
  type: z.literal("email"),
  value: SupportContactEmailValueSchema,
});

export const SupportContactPhoneInputSchema = z.object({
  type: z.literal("phone"),
  value: SupportContactPhoneValueSchema,
});

export const SupportContactWebsiteInputSchema = z.object({
  type: z.literal("website"),
  value: SupportContactWebsiteValueSchema,
});

export const SupportContactInputSchema = z.discriminatedUnion("type", [
  SupportContactEmailInputSchema,
  SupportContactPhoneInputSchema,
  SupportContactWebsiteInputSchema,
]);

export const StrictSupportContactInputSchema = z.discriminatedUnion("type", [
  SupportContactEmailInputSchema.strict(),
  SupportContactPhoneInputSchema.strict(),
  SupportContactWebsiteInputSchema.strict(),
]);
