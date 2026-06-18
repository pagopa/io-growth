// Adapter factories
export { createGestioneDomandaCedClient } from "./adapters/outbound/gestione-domanda-ced.js";
// Client initialisation
export { initInpsCedClient } from "./client.js";

// Config
export { buildInpsCedConfig, inpsCedConfigSchema } from "./config.js";

export type { InpsCedConfig, InpsCedEnvConfig } from "./config.js";

// Port interfaces
export type { GestioneDomandaCedRepository } from "./domain/ports/outbound/gestione-domanda-ced.repository.js";
