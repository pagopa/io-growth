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
      COSMOS_CONTAINER_NAME: z.string().min(1),
      COSMOS_CONTAINER_NAME_TEST: z.string().min(1),
      COSMOS_DATABASE_NAME: z.string().min(1),
      COSMOS_ENDPOINT: z.url(),
      /**
       * Account master/readonly key. Set only for local development against
       * the Cosmos DB Emulator, which does not support Azure AD auth. Leave
       * unset in every real environment so the client authenticates via
       * `DefaultAzureCredential` (Managed Identity).
       */
      COSMOS_KEY: z.string().optional(),
      HOST: z.string().default("0.0.0.0"),
      // No fallback: test users must never reach the prod INPS environment.
      INPS_CED_BASE_URL_TEST: z.url(),
      // ModI settings that differ in the test INPS environment; the rest is shared.
      MODI_ENVIRONMENT_TEST: z.enum(["collaudo", "produzione"]),
      MODI_HTTPS_CLIENT_CERT_SECRET_NAME_TEST: z.string().min(1),
      MODI_HTTPS_CLIENT_KEY_SECRET_NAME_TEST: z.string().min(1),
      MODI_INPS_BASE_URL_TEST: z.url(),
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
  /** ModI config of the test INPS environment (prod config with the *_TEST overrides). */
  readonly modiTest: ModiEnvConfig;
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

  return {
    ...result.data,
    modi: modiResult.data,
    // Cert and key are not inherited: test must never present the prod client certificate.
    modiTest: {
      ...modiResult.data,
      MODI_ENVIRONMENT: result.data.MODI_ENVIRONMENT_TEST,
      MODI_HTTPS_CLIENT_CERT_SECRET_NAME:
        result.data.MODI_HTTPS_CLIENT_CERT_SECRET_NAME_TEST,
      MODI_HTTPS_CLIENT_KEY_SECRET_NAME:
        result.data.MODI_HTTPS_CLIENT_KEY_SECRET_NAME_TEST,
      MODI_INPS_BASE_URL: result.data.MODI_INPS_BASE_URL_TEST,
    },
  };
};
