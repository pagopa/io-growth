import { z } from "zod";

const configSchema = z.object({
  ADMIN_FISCAL_CODES: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [],
    ),
  ADMIN_FISCAL_CODES_TEST: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [],
    ),
  // AR (Area Riservata) — production instance
  AR_API_KEY: z.string().min(1),
  // AR (Area Riservata) — test instance
  AR_API_KEY_TEST: z.string().min(1),

  AR_ENDPOINT: z.string().url(),
  AR_ENDPOINT_TEST: z.string().url(),
  AZURE_CLIENT_ID: z.string().optional(),
  CED_PORTAL_FE_BASE_URL: z.string().min(1),
  CED_PRODUCT_ID: z.string().min(1),
  HOST: z.string().default("0.0.0.0"),
  OPERATORS_FISCAL_CODES_TEST: z
    .string()
    .optional()
    .transform((v) =>
      v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [],
    ),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_DB_TEST: z.string().min(1).optional(),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_PORT: z.coerce.number().int().min(1).max(65535).default(6432),
  POSTGRES_SSL: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  POSTGRES_USER: z.string().min(1),
  REDIS_ENDPOINT: z.string().min(1),
  REDIS_TLS: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export type AppConfig = z.infer<typeof configSchema>;

export const parseConfig = (): AppConfig => {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid configuration:\n${result.error.message}`);
  }
  return result.data;
};
