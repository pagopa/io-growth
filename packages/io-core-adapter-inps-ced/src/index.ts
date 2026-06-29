// Adapter factories
export { createGestioneDomandaCedClient } from "./adapters/outbound/gestione-domanda-ced.js";
// Client initialisation
export { initInpsCedClient } from "./client.js";

// Identity context type — used by the app layer to type the getter it passes
// to initInpsCedClient. The adapter itself has no AsyncLocalStorage.
export type { InpsIdentityContext } from "./client.js";

// Config
export { buildInpsCedConfig, inpsCedConfigSchema } from "./config.js";

export type { InpsCedConfig, InpsCedEnvConfig } from "./config.js";

// Port interfaces
export type {
  GestioneDomandaCedRepository,
  IdempotencyOptions,
} from "./domain/ports/outbound/gestione-domanda-ced.repository.js";
