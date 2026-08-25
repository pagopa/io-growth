// Adapter factories
export { createGestioneDomandaCedClient } from "./adapters/outbound/gestione-domanda-ced.js";
// Client initialisation
export { initInpsCedClient } from "./client.js";

// Types used by the app layer to type the values it passes to initInpsCedClient
export type { InpsCedTelemetry, InpsIdentityContext } from "./client.js";

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
