// Adapter factories
export { createKeyvaultCredentialProvider } from "./adapters/outbound/keyvault/keyvault-credential-provider.js";
// Config
export { buildModiConfig, modiConfigSchema } from "./config.js";

export type { ModiConfig, ModiEnvConfig } from "./config.js";

// Port interfaces
export type {
  HttpsClientCredentials,
  ModiCredentialProvider,
  SigningCredentials
} from "./domain/ports/outbound/credential-provider.port.js";

// Signed-fetch primitive
export { createSignedFetch } from "./signed-fetch.js";
export type { SignedFetch } from "./signed-fetch.js";

