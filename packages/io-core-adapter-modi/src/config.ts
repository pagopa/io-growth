import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Env schemas — discriminated on MODI_PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/** Fields required by every profile. */
const baseEnvSchema = z.object({
  MODI_CODICE_ENTE: z.string().min(1),
  MODI_DEFAULT_CODICE_UFFICIO: z.string().min(1),
  MODI_ENVIRONMENT: z.enum(["collaudo", "produzione"]),
  MODI_ID_TIPO_UTENTE: z.string().min(1),
  MODI_INPS_BASE_URL: z.string().url(),
  MODI_KEYVAULT_URL: z.string().url(),
  MODI_SIGNING_CERT_SECRET_NAME: z.string().min(1),
  MODI_SIGNING_KEY_SECRET_NAME: z.string().min(1),
});

/**
 * P1 (ID_AUTH_REST_01): JWT authentication only.
 * No mTLS, no body-digest, no response non-repudiation.
 */
const p1EnvSchema = baseEnvSchema.extend({
  MODI_PROFILE: z.literal("P1"),
});

/**
 * P2 (ID_AUTH_REST_01 + INTEGRITY_REST_01): JWT auth + body integrity.
 * No mTLS, no response non-repudiation.
 */
const p2EnvSchema = baseEnvSchema.extend({
  MODI_PROFILE: z.literal("P2"),
});

/**
 * P3 (ID_AUTH_CHANNEL_02 + INTEGRITY_REST_01 + PROFILE_NON_REPUDIATION_01):
 * Full profile — mTLS, body integrity, response non-repudiation.
 */
const p3EnvSchema = baseEnvSchema.extend({
  MODI_HTTPS_CLIENT_CERT_SECRET_NAME: z.string().min(1),
  MODI_HTTPS_CLIENT_KEY_SECRET_NAME: z.string().min(1),
  MODI_INPS_HTTPS_CA_SECRET_NAME: z.string().min(1),
  MODI_INPS_SIGNING_CA_SECRET_NAME: z.string().min(1),
  MODI_PROFILE: z.literal("P3"),
});

export const modiConfigSchema = z.discriminatedUnion("MODI_PROFILE", [
  p1EnvSchema,
  p2EnvSchema,
  p3EnvSchema,
]);

export type ModiConfig = ModiP1Config | ModiP2Config | ModiP3Config;

// ─────────────────────────────────────────────────────────────────────────────
// Domain config types — discriminated union matching env schemas
// ─────────────────────────────────────────────────────────────────────────────

export type ModiEnvConfig = z.infer<typeof modiConfigSchema>;

export interface ModiP1Config extends ModiBaseConfig {
  readonly profile: "P1";
  readonly secretNames: ModiP1P2SecretNames;
}

export interface ModiP2Config extends ModiBaseConfig {
  readonly profile: "P2";
  readonly secretNames: ModiP1P2SecretNames;
}

export interface ModiP3Config extends ModiBaseConfig {
  readonly profile: "P3";
  readonly secretNames: ModiP3SecretNames;
}

interface ModiBaseConfig {
  readonly codiceEnte: string;
  readonly defaultCodiceUfficio: string;
  readonly environment: "collaudo" | "produzione";
  readonly idTipoUtente: string;
  readonly inpsBaseUrl: string;
  readonly keyVaultUrl: string;
}

interface ModiP1P2SecretNames {
  readonly signingCert: string;
  readonly signingKey: string;
}

interface ModiP3SecretNames extends ModiP1P2SecretNames {
  readonly httpsClientCert: string;
  readonly httpsClientKey: string;
  readonly inpsHttpsCa: string;
  readonly inpsSigningCa: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder
// ─────────────────────────────────────────────────────────────────────────────

export const buildModiConfig = (env: ModiEnvConfig): ModiConfig => {
  const base: ModiBaseConfig = {
    codiceEnte: env.MODI_CODICE_ENTE,
    defaultCodiceUfficio: env.MODI_DEFAULT_CODICE_UFFICIO,
    environment: env.MODI_ENVIRONMENT,
    idTipoUtente: env.MODI_ID_TIPO_UTENTE,
    inpsBaseUrl: env.MODI_INPS_BASE_URL,
    keyVaultUrl: env.MODI_KEYVAULT_URL,
  };

  if (env.MODI_PROFILE === "P1" || env.MODI_PROFILE === "P2") {
    return {
      ...base,
      profile: env.MODI_PROFILE,
      secretNames: {
        signingCert: env.MODI_SIGNING_CERT_SECRET_NAME,
        signingKey: env.MODI_SIGNING_KEY_SECRET_NAME,
      },
    };
  }

  return {
    ...base,
    profile: "P3",
    secretNames: {
      httpsClientCert: env.MODI_HTTPS_CLIENT_CERT_SECRET_NAME,
      httpsClientKey: env.MODI_HTTPS_CLIENT_KEY_SECRET_NAME,
      inpsHttpsCa: env.MODI_INPS_HTTPS_CA_SECRET_NAME,
      inpsSigningCa: env.MODI_INPS_SIGNING_CA_SECRET_NAME,
      signingCert: env.MODI_SIGNING_CERT_SECRET_NAME,
      signingKey: env.MODI_SIGNING_KEY_SECRET_NAME,
    },
  };
};
