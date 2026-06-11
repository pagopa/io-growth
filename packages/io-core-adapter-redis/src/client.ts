import { DefaultAzureCredential } from "@azure/identity";
import { createCluster } from "@redis/client";
import {
  EntraIdCredentialsProviderFactory,
  REDIS_SCOPE_DEFAULT,
} from "@redis/entraid";
import * as net from "node:net";

export interface EntraIdConfig {
  readonly clientId: string;
}

export type RedisClient = RedisClientInstance & {
  readonly closeConnection: () => Promise<void>;
};

export interface RedisClientConfig {
  readonly endpoint: string;
  readonly entraId?: EntraIdConfig;
  readonly onError?: (error: unknown) => void;
  readonly tls?: boolean;
}

export type RedisClientInstance = ReturnType<typeof createCluster>;

export interface RedisCommands {
  del(key: string): Promise<number>;
  get(key: string): Promise<null | string>;
  ping(): Promise<string>;
  set(key: string, value: string): Promise<unknown>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
}

const buildEntraIdCredentialsProvider = () =>
  EntraIdCredentialsProviderFactory.createForDefaultAzureCredential({
    credential: new DefaultAzureCredential(),
    scopes: REDIS_SCOPE_DEFAULT,
    tokenManagerConfig: {
      expirationRefreshRatio: 0.8,
    },
  });

const makeNodeAddressMap =
  (redisHostName: string) =>
    (incomingAddress: string): { host: string; port: number } => {
      const [hostNameOrIp = redisHostName, port = "10000"] =
        incomingAddress.split(":");
      return {
        host: net.isIP(hostNameOrIp) !== 0 ? redisHostName : hostNameOrIp,
        port: Number(port),
      };
    };

export const createRedisClient = async (
  config: RedisClientConfig,
): Promise<RedisClient> => {
  const [redisHostName = config.endpoint] = config.endpoint.split(":");
  const useTls = config.tls ?? false;
  const scheme = useTls ? "rediss" : "redis";

  const client = createCluster({
    defaults: {
      credentialsProvider: config.entraId
        ? buildEntraIdCredentialsProvider()
        : undefined,
      socket: {
        connectTimeout: 15000,
        ...(useTls ? { tls: true } : {}),
      },
    },
    ...(useTls ? { nodeAddressMap: makeNodeAddressMap(redisHostName) } : {}),
    rootNodes: [{ url: `${scheme}://${config.endpoint}` }],
  });
  await client.connect();
  return Object.assign(client, {
    closeConnection: () => client.quit().then(() => undefined),
  }) as unknown as RedisClient;
};

export type ResilientRedisClient = RedisCommands & {
  readonly closeConnection: () => Promise<void>;
};

export const createResilientRedisClient = async (
  config: RedisClientConfig,
): Promise<ResilientRedisClient> => {
  const onError = (error: unknown) => {
    config.onError?.(error);
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
