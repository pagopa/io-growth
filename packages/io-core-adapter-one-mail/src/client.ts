import type { OneMailConfig } from "./config.js";
import type { EmailRepository } from "./domain/ports/outbound/email.repository.js";
import type { HealthRepository } from "./domain/ports/outbound/health.repository.js";

import { createEmailClient } from "./adapters/outbound/email.js";
import { createHealthClient } from "./adapters/outbound/health.js";
import { createCustomFetch } from "./fetch.js";

/**
 * Bundle of the OneMail outbound clients, both bound to a single
 * {@link OneMailConfig}. Import this into an app's composition root and pass
 * app-specific config (including, optionally, `onEmailSent`/`onEmailError`
 * telemetry callbacks) — no global state, no `AsyncLocalStorage`.
 */
export interface OneMailClient {
  readonly emailClient: EmailRepository;
  readonly healthClient: HealthRepository;
}

/**
 * Creates the OneMail client bundle.
 *
 * @param config Base URL, API key, and optional `onEmailSent`/`onEmailError`
 * callbacks, built by the app from its own env vars (see
 * {@link buildOneMailConfig}) plus its telemetry client (e.g.
 * `telemetryClient.trackEvent` / `telemetryClient.trackException` from
 * `@pagopa/io-core-adapter-tracing`).
 */
export const createOneMailClient = (config: OneMailConfig): OneMailClient => {
  const customFetch = createCustomFetch(config);
  return {
    emailClient: createEmailClient(customFetch, config),
    healthClient: createHealthClient(customFetch),
  };
};
