// Adapter factories
export {
  createGestioneDomandaCedClient,
  createInpsCedClient,
} from "./adapters/outbound/gestione-domanda-ced.js";

// Types used by the app layer to build the client options
export type {
  CustomFetch,
  InpsCedClientOptions,
  InpsCedTelemetry,
  InpsIdentityContext,
} from "./client.js";

// Config
export { buildInpsCedConfig, inpsCedConfigSchema } from "./config.js";

export type { InpsCedConfig, InpsCedEnvConfig } from "./config.js";

// Port interfaces
export type {
  GestioneDomandaCedRepository,
  IdempotencyOptions,
} from "./domain/ports/outbound/gestione-domanda-ced.repository.js";

// Generated model types & enums — needed by the app layer to build requests
// and map INPS responses (e.g. TipoEsitoCheck milestone → application state).
export * from "./generated/model/index.js";
