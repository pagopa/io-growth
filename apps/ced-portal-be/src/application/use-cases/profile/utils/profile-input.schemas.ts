import { z } from "zod";

const OperatorProfileSupportContactSchema = z
  .object({
    type: z.enum(["email", "phone", "website"]),
    value: z.string().min(1).max(2048),
  })
  .strict();

const OperatorProfileAddressSchema = z
  .object({
    city: z.string().min(1).max(64),
    country: z.string().min(1).max(64),
    postalCode: z.string().min(1).max(64),
    state: z.string().min(1).max(64),
    street: z.string().min(1).max(512),
  })
  .strict();

const OperatorProfileWebsiteSchema = z
  .object({
    url: z.url().max(2048),
  })
  .strict();

export const OperatorProfilePlaceInputSchema = z.discriminatedUnion("type", [
  z
    .object({
      address: OperatorProfileAddressSchema,
      name: z.string().min(1).max(512),
      supportContacts: z.array(OperatorProfileSupportContactSchema),
      type: z.literal("offline"),
    })
    .strict(),
  z
    .object({
      name: z.string().min(1).max(512),
      supportContacts: z.array(OperatorProfileSupportContactSchema),
      type: z.literal("online"),
      website: OperatorProfileWebsiteSchema,
    })
    .strict(),
]);

export const OperatorProfileInputSchema = z
  .object({
    contactEmail: z.email().max(512),
    displayName: z.string().min(1).max(512),
    place: OperatorProfilePlaceInputSchema,
  })
  .strict();

export const OperatorCreateProfileInputSchema =
  OperatorProfileInputSchema.extend({
    image: z.instanceof(File),
    logo: z.instanceof(File),
    operatorId: z.ulid(),
  });

export const OperatorUpdateProfileInputSchema =
  OperatorProfileInputSchema.extend({
    image: z.instanceof(File).optional(),
    logo: z.instanceof(File).optional(),
    operatorId: z.ulid(),
  });

export const OperatorUpdateProfileMultipartBodySchema = z
  .object({
    image: z.instanceof(File).optional(),
    logo: z.instanceof(File).optional(),
    profile: OperatorProfileInputSchema,
  })
  .strict();
