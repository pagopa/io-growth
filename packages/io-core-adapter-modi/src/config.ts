import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Env schemas — discriminated on MODI_PROFILE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fields required by every profile.
 * All profiles use ID_AUTH_CHANNEL_02 (mTLS): the HTTPS client cert/key and the
 * INPS HTTPS server CA chain are common to P1, P2, and P3 because INPS uses a
 * private CA that is not in the system trust store.
 * When these three vars are absent the app delegates mTLS to an upstream
 * nginx proxy (local-dev scenario). When present the app performs mTLS itself
 * (production direct-to-INPS scenario).
 */
const baseEnvSchema = z.object({
  MODI_CODICE_ENTE: z.string().min(1),
  MODI_DEFAULT_CODICE_UFFICIO: z.string().min(1),
  MODI_ENVIRONMENT: z.enum(["collaudo", "produzione"]),
  MODI_HTTPS_CLIENT_CERT_SECRET_NAME: z.string().min(1).optional(),
  MODI_HTTPS_CLIENT_KEY_SECRET_NAME: z.string().min(1).optional(),
  MODI_ID_TIPO_UTENTE: z.string().min(1),
  MODI_INPS_BASE_URL: z.string().url(),
  MODI_INPS_HTTPS_CA_SECRET_NAME: z.string().min(1).optional(),
  MODI_INPS_TLS_REJECT_UNAUTHORIZED: z.enum(["true", "false"]).optional(),
  MODI_KEYVAULT_URL: z.string().url(),
});

/** Additional fields required by profiles with message-level signing (P2 and P3). */
const signingEnvSchema = baseEnvSchema.extend({
  MODI_SIGNING_CERT_SECRET_NAME: z.string().min(1),
  MODI_SIGNING_KEY_SECRET_NAME: z.string().min(1),
});

/**
 * P1 (ID_AUTH_CHANNEL_02): mTLS client cert only.
 * No message-level JWT signing, no body-digest, no response non-repudiation.
 */
const p1EnvSchema = baseEnvSchema.extend({
  MODI_PROFILE: z.literal("P1"),
});

/**
 * P2 (ID_AUTH_CHANNEL_02 + PROFILE_CONF_ID_AUTH_01): mTLS + JWT signing.
 * Adds message-level auth JWT (Agid-JWT-Signature) and body digest.
 * No response non-repudiation.
 */
const p2EnvSchema = signingEnvSchema.extend({
  MODI_PROFILE: z.literal("P2"),
});

/**
 * P3 (ID_AUTH_CHANNEL_02 + PROFILE_NON_REPUDIATION_01): Full profile.
 * mTLS, JWT signing with body integrity, response non-repudiation.
 */
const p3EnvSchema = signingEnvSchema.extend({
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

/**
 * mTLS secret names — all optional.
 * Set when the app connects directly to INPS (production).
 * Omit when an upstream nginx proxy handles mTLS on the app’s behalf (local-dev).
 */
export interface ModiMtlsSecretNames {
  readonly httpsClientCert?: string;
  readonly httpsClientKey?: string;
  readonly inpsHttpsCa?: string;
}

export interface ModiP1Config extends ModiBaseConfig {
  readonly profile: "P1";
  /** P1 uses only mTLS (ID_AUTH_CHANNEL_02) — no message-level signing. */
  readonly secretNames: ModiMtlsSecretNames;
}

export interface ModiP2Config extends ModiBaseConfig {
  readonly profile: "P2";
  readonly secretNames: ModiMtlsSecretNames & ModiSigningSecretNames;
}

export interface ModiP3Config extends ModiBaseConfig {
  readonly profile: "P3";
  readonly secretNames: ModiMtlsSecretNames &
    ModiSigningSecretNames & {
      readonly inpsSigningCa: string;
    };
}

/** JWT signing secret names — required by P2 and P3. */
export interface ModiSigningSecretNames {
  readonly signingCert: string;
  readonly signingKey: string;
}

interface ModiBaseConfig {
  readonly codiceEnte: string;
  readonly defaultCodiceUfficio: string;
  readonly environment: "collaudo" | "produzione";
  readonly idTipoUtente: string;
  readonly inpsBaseUrl: string;
  readonly inpsTlsRejectUnauthorized: boolean;
  readonly keyVaultUrl: string;
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
    inpsTlsRejectUnauthorized:
      env.MODI_INPS_TLS_REJECT_UNAUTHORIZED !== "false",
    keyVaultUrl: env.MODI_KEYVAULT_URL,
  };

  const mtlsSecretNames: ModiMtlsSecretNames = {
    httpsClientCert: env.MODI_HTTPS_CLIENT_CERT_SECRET_NAME,
    httpsClientKey: env.MODI_HTTPS_CLIENT_KEY_SECRET_NAME,
    inpsHttpsCa: env.MODI_INPS_HTTPS_CA_SECRET_NAME,
  };

  if (env.MODI_PROFILE === "P1") {
    return { ...base, profile: "P1", secretNames: mtlsSecretNames };
  }

  const signingSecretNames: ModiSigningSecretNames = {
    signingCert: env.MODI_SIGNING_CERT_SECRET_NAME,
    signingKey: env.MODI_SIGNING_KEY_SECRET_NAME,
  };

  if (env.MODI_PROFILE === "P2") {
    return {
      ...base,
      profile: "P2",
      secretNames: { ...mtlsSecretNames, ...signingSecretNames },
    };
  }

  return {
    ...base,
    profile: "P3",
    secretNames: {
      ...mtlsSecretNames,
      ...signingSecretNames,
      inpsSigningCa: env.MODI_INPS_SIGNING_CA_SECRET_NAME,
    },
  };
};
