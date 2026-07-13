import { z } from "zod";

export const inpsCedConfigSchema = z.object({
  /**
   * The ModI API identifier for GestioneDomandaCED.
   * Value comes from the INPS eService descriptor (aud claim in signed JWT).
   * Must be confirmed during formal adhesion.
   */
  INPS_CED_AUDIENCE: z.string().min(1),

  /**
   * Base URL for the GestioneDomandaCED API (without trailing slash).
   * Provided by INPS after adhesion (eService descriptor endpoint).
   */
  INPS_CED_BASE_URL: z.string().url(),
});

export interface InpsCedConfig {
  readonly audience: string;
  readonly baseUrl: string;
}

export type InpsCedEnvConfig = z.infer<typeof inpsCedConfigSchema>;

export const buildInpsCedConfig = (env: InpsCedEnvConfig): InpsCedConfig => ({
  audience: env.INPS_CED_AUDIENCE,
  baseUrl: env.INPS_CED_BASE_URL,
});
