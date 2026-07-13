import { Agent } from "undici";

/**
 * Creates an undici Agent configured for mutual TLS (ID_AUTH_CHANNEL_02).
 *
 * @param cert - PEM-encoded client certificate (may include chain)
 * @param key  - PEM-encoded client private key
 * @param ca   - PEM-encoded INPS HTTPS server CA chain (trust anchor)
 */
export const createMtlsDispatcher = (options: {
  ca: string;
  cert: string;
  key: string;
}): Agent =>
  new Agent({
    connect: {
      ca: options.ca,
      cert: options.cert,
      key: options.key,
    },
  });
