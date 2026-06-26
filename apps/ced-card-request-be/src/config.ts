import { fimsConfigSchema } from "@pagopa/io-core-adapter-fims";
import { azureTracingConfigSchema } from "@pagopa/io-core-adapter-tracing";
import { z } from "zod";

const configSchema = fimsConfigSchema.merge(azureTracingConfigSchema).merge(
  z.object({
    AZURE_CLIENT_ID: z.string().optional(),
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

export type AppConfig = z.infer<typeof configSchema>;

export const parseConfig = (): AppConfig => {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid configuration:\n${result.error.message}`);
  }
  return result.data;
};
