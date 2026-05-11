import { EntraIdCredentialsProviderFactory } from "@redis/entraid";
import { createCluster } from "redis";

export interface EntraIdConfig {
  readonly clientId: string;
}

export type RedisClientInstance = ReturnType<typeof createCluster>;

export type RedisClient = RedisClientInstance & {
  readonly closeConnection: () => Promise<void>;
};

export interface RedisClientConfig {
  readonly entraId?: EntraIdConfig;
  readonly endpoint: string;
  readonly tls?: boolean;
}

export interface RedisCommands {
  del(key: string): Promise<number>;
  get(key: string): Promise<null | string>;
  ping(): Promise<string>;
  set(key: string, value: string): Promise<unknown>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
}

const buildEntraIdCredentialsProvider = (entraId: EntraIdConfig) =>
  EntraIdCredentialsProviderFactory.createForUserAssignedManagedIdentity({
    clientId: entraId.clientId,
    tokenManagerConfig: { expirationRefreshRatio: 0.8 },
    userAssignedClientId: entraId.clientId,
  });

export const createRedisClient = async (
  config: RedisClientConfig,
): Promise<RedisClient> => {
  const [host, portStr] = config.endpoint.split(":");
  const port = Number(portStr);

  const client = createCluster({
    defaults: {
      credentialsProvider: config.entraId
        ? buildEntraIdCredentialsProvider(config.entraId)
        : undefined,
      socket: {
        host,
        port,
        ...(config.tls ? { tls: true as const } : {}),
      },
    },
    rootNodes: [{ socket: { host, port } }],
  });

  await client.connect();

  return Object.assign(client, {
    closeConnection: () => client.quit().then(() => undefined),
  });
};

export type ResilientRedisClient = RedisCommands & {
  readonly closeConnection: () => Promise<void>;
};

export const createResilientRedisClient = async (
  config: RedisClientConfig,
): Promise<ResilientRedisClient> => {
  const onError = (error: unknown) => {
    // TODO: send this log through OpenTelemetry instead of console.error.
    console.error("Redis client error:", error);
  };

  let client = await createRedisClient(config);
  client.on("error", onError);
  let reconnectPromise: null | Promise<RedisClient> = null;

  const getClient = async (): Promise<RedisClient> => {
    if (client.isReady) {
      return client;
    }
    if (reconnectPromise === null) {
      reconnectPromise = client
        .closeConnection()
        .catch(() => undefined)
        .then(() => createRedisClient(config))
        .then(
          (newClient) => {
            newClient.on("error", onError);
            client = newClient;
            reconnectPromise = null;
            return newClient;
          },
          (error: unknown) => {
            reconnectPromise = null;
            throw error;
          },
        );
    }
    return reconnectPromise;
  };

  return {
    closeConnection: () => client.closeConnection(),
    del: (key) => getClient().then((c) => c.del(key)),
    get: (key) => getClient().then((c) => c.get(key)),
    ping: () => getClient().then((c) => c.ping()),
    set: (key, value) => getClient().then((c) => c.set(key, value)),
    setEx: (key, seconds, value) =>
      getClient().then((c) => c.setEx(key, seconds, value)),
  };
};
