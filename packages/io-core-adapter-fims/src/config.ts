import { z } from "zod";

import type { FimsAuthFlowConfig, OidcConfig } from "./domain/types.js";

/**
 * Shared Zod schema for all FIMS-related environment variables.
 * Both `ced-browser-be` and `ced-card-request-be` extend this with their
 * own app-specific fields (HOST, PORT, REDIS_*, FIMS_AUDIT_*).
 */
export const fimsConfigSchema = z.object({
  BASE_URL: z.string().url(),
  FIMS_AUDIT_BLOB_URI: z.string().url(),
  FIMS_AUDIT_CONTAINER: z.string().min(1),
  FIMS_CLIENT_ID: z.string().min(1),
  FIMS_CLIENT_SECRET: z.string().min(1),
  FIMS_ISSUER_URL: z.string().url(),
  FIMS_REDIRECT_URL: z.string().url(),
  FIMS_SCOPE: z.string().min(1),
  PAGOPA_IDP_KEYS_BASE_URL: z.string().url(),
  /**
   * Comma-separated list of SHA-256 hashed fiscal codes for test users.
   * Leave empty to disable the `/test-session` endpoint for all users.
   */
  TEST_USERS: z.string().default(""),
});

export interface FimsConfig {
  readonly fimsFlowConfig: FimsAuthFlowConfig;
  readonly oidcConfig: OidcConfig;
}

export type FimsEnvConfig = z.infer<typeof fimsConfigSchema>;

/**
 * Map validated FIMS env vars to the strongly-typed config objects consumed by
 * `createOidcClient` and `createFimsAuthFlow`.
 */
export const buildFimsConfig = (config: FimsEnvConfig): FimsConfig => ({
  fimsFlowConfig: {
    baseUrl: config.BASE_URL,
    fimsRedirectUrl: config.FIMS_REDIRECT_URL,
    idpKeysBaseUrl: config.PAGOPA_IDP_KEYS_BASE_URL,
    issuerUrl: config.FIMS_ISSUER_URL,
    testUsers: config.TEST_USERS
      ? config.TEST_USERS.split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  },
  oidcConfig: {
    clientId: config.FIMS_CLIENT_ID,
    clientSecret: config.FIMS_CLIENT_SECRET,
    issuerUrl: config.FIMS_ISSUER_URL,
    redirectUri: config.FIMS_REDIRECT_URL,
    scope: config.FIMS_SCOPE,
  },
});
