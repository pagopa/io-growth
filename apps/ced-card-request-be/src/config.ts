import { fimsConfigSchema } from "@pagopa/io-core-adapter-fims";
import { inpsCedConfigSchema } from "@pagopa/io-core-adapter-inps-ced";
import {
  modiConfigSchema,
  type ModiEnvConfig,
} from "@pagopa/io-core-adapter-modi";
import { azureTracingConfigSchema } from "@pagopa/io-core-adapter-tracing";
import { z } from "zod";

const appConfigSchema = fimsConfigSchema
  .merge(azureTracingConfigSchema)
  .merge(inpsCedConfigSchema)
  .merge(
    z.object({
      AZURE_CLIENT_ID: z.string().optional(),
      AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
      COSMOS_ENDPOINT: z.string().url(),
      HOST: z.string().default("0.0.0.0"),
      PORT: z.coerce.number().int().min(1).max(65535).default(8080),
      REDIS_ENDPOINT: z.string().min(1),
      REDIS_TLS: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    }),
  );

export type AppConfig = z.infer<typeof appConfigSchema> & {
  /** ModI interoperability profile config (discriminated on MODI_PROFILE). */
  readonly modi: ModiEnvConfig;
};

export const parseConfig = (): AppConfig => {
  const result = appConfigSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid configuration:\n${result.error.message}`);
  }

  // ModI config is a discriminated union (on MODI_PROFILE) and cannot be
  // merged into the app object schema, so it is parsed separately.
  const modiResult = modiConfigSchema.safeParse(process.env);
  if (!modiResult.success) {
    throw new Error(`Invalid ModI configuration:\n${modiResult.error.message}`);
  }

  return { ...result.data, modi: modiResult.data };
};
