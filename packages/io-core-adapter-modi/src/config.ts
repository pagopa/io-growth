import { z } from "zod";

export const modiConfigSchema = z.object({
  MODI_CODICE_ENTE: z.string().min(1),
  MODI_DEFAULT_CODICE_UFFICIO: z.string().min(1),
  MODI_ENVIRONMENT: z.enum(["collaudo", "produzione"]),
  MODI_HTTPS_CLIENT_CERT_SECRET_NAME: z.string().min(1),
  MODI_HTTPS_CLIENT_KEY_SECRET_NAME: z.string().min(1),
  MODI_ID_TIPO_UTENTE: z.string().min(1),
  MODI_INPS_BASE_URL: z.string().url(),
  MODI_INPS_HTTPS_CA_SECRET_NAME: z.string().min(1),
  MODI_INPS_SIGNING_CA_SECRET_NAME: z.string().min(1),
  MODI_KEYVAULT_URL: z.string().url(),
  MODI_SIGNING_CERT_SECRET_NAME: z.string().min(1),
  MODI_SIGNING_KEY_SECRET_NAME: z.string().min(1),
});

export interface ModiConfig {
  readonly codiceEnte: string;
  readonly defaultCodiceUfficio: string;
  readonly environment: "collaudo" | "produzione";
  readonly idTipoUtente: string;
  readonly inpsBaseUrl: string;
  readonly keyVaultUrl: string;
  readonly secretNames: {
    readonly httpsClientCert: string;
    readonly httpsClientKey: string;
    readonly inpsHttpsCa: string;
    readonly inpsSigningCa: string;
    readonly signingCert: string;
    readonly signingKey: string;
  };
}

export type ModiEnvConfig = z.infer<typeof modiConfigSchema>;

export const buildModiConfig = (env: ModiEnvConfig): ModiConfig => ({
  codiceEnte: env.MODI_CODICE_ENTE,
  defaultCodiceUfficio: env.MODI_DEFAULT_CODICE_UFFICIO,
  environment: env.MODI_ENVIRONMENT,
  idTipoUtente: env.MODI_ID_TIPO_UTENTE,
  inpsBaseUrl: env.MODI_INPS_BASE_URL,
  keyVaultUrl: env.MODI_KEYVAULT_URL,
  secretNames: {
    httpsClientCert: env.MODI_HTTPS_CLIENT_CERT_SECRET_NAME,
    httpsClientKey: env.MODI_HTTPS_CLIENT_KEY_SECRET_NAME,
    inpsHttpsCa: env.MODI_INPS_HTTPS_CA_SECRET_NAME,
    inpsSigningCa: env.MODI_INPS_SIGNING_CA_SECRET_NAME,
    signingCert: env.MODI_SIGNING_CERT_SECRET_NAME,
    signingKey: env.MODI_SIGNING_KEY_SECRET_NAME,
  },
});
