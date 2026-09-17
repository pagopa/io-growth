import { z } from "zod";

/**
 * Configuration consumed by the OneMail outbound client. The app composition
 * root builds this (typically from environment variables plus its own
 * telemetry callbacks) and passes it to {@link createOneMailClient}.
 */
export interface OneMailConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  /** Called when a send request is rejected by OneMail or fails outright. */
  readonly onEmailError?: (event: OneMailErrorEvent) => void;
  /** Called after OneMail accepts an email for delivery (HTTP 202). */
  readonly onEmailSent?: (event: OneMailSentEvent) => void;
}

export interface OneMailErrorEvent {
  readonly error: Error;
  readonly method: string;
  readonly route: string;
  readonly url: string;
}

export interface OneMailSentEvent {
  readonly priority: "high" | "low";
  readonly requestId: string;
}

export const oneMailConfigSchema = z.object({
  ONE_MAIL_API_KEY: z.string().min(1),
  ONE_MAIL_BASE_URL: z.string().url(),
});

export type OneMailEnvConfig = z.infer<typeof oneMailConfigSchema>;

export const buildOneMailConfig = (env: OneMailEnvConfig): OneMailConfig => ({
  apiKey: env.ONE_MAIL_API_KEY,
  baseUrl: env.ONE_MAIL_BASE_URL,
});
