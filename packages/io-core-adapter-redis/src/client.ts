import type { RedisClusterType } from "@redis/client";

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
  /** Max time for a command, including the wait for a (re)connection. */
  readonly commandTimeoutMs?: number;
  /** Max total time to connect to the cluster (discovery and all nodes). */
  readonly connectTimeoutMs?: number;
  readonly endpoint: string;
  readonly entraId?: EntraIdConfig;
  readonly onError?: (error: unknown) => void;
  readonly tls?: boolean;
}

export type RedisClientInstance = RedisClusterType;

export interface RedisCommands {
  del(key: string): Promise<number>;
  get(key: string): Promise<null | string>;
  ping(): Promise<string>;
  set(key: string, value: string): Promise<unknown>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
}

const DEFAULT_COMMAND_TIMEOUT_MS = 2_000;
const DEFAULT_CONNECT_TIMEOUT_MS = 20_000;
// Timeout of a single socket attempt: node-redis retries failed attempts on
// its own, so the overall bound is DEFAULT_CONNECT_TIMEOUT_MS.
const SOCKET_CONNECT_TIMEOUT_MS = 5_000;
// After this many failed commands in a row the cluster client is discarded
// and rebuilt, in case node-redis is stuck on dead connections.
const MAX_CONSECUTIVE_FAILURES = 3;
// Minimum delay between a failed reconnection and the next attempt.
const RECONNECT_BACKOFF_MS = 1_000;

const withDeadline = <T>(
  timeoutMs: number,
  operation: string,
  task: (signal: AbortSignal) => Promise<T>,
): Promise<T> => {
  const controller = new AbortController();
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(
        `Redis ${operation} timed out after ${timeoutMs}ms`,
      );
      controller.abort(error);
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([task(controller.signal), deadline]).finally(() =>
    clearTimeout(timer),
  );
};

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
  const commandTimeoutMs =
    config.commandTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
  const onError = config.onError ?? (() => undefined);

  const client = createCluster({
    defaults: {
      credentialsProvider: config.entraId
        ? buildEntraIdCredentialsProvider()
        : undefined,
      socket: {
        connectTimeout: SOCKET_CONNECT_TIMEOUT_MS,
        ...(useTls ? { tls: true } : {}),
      },
    },
    ...(useTls ? { nodeAddressMap: makeNodeAddressMap(redisHostName) } : {}),
    rootNodes: [{ url: `${scheme}://${config.endpoint}` }],
  });
  // The cluster reports its own failures as "error" and the failures of the
  // single node connections as "node-error".
  client.on("error", onError).on("node-error", onError);

  try {
    await withDeadline(
      config.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS,
      "connect",
      () => client.connect(),
    );
  } catch (error) {
    client.destroy();
    throw error;
  }

  return Object.assign(client, {
    // close() waits for in-flight replies, which never arrive on a dead socket.
    closeConnection: () =>
      withDeadline(commandTimeoutMs, "close", () => client.close()).catch(() =>
        client.destroy(),
      ),
  });
};

export type ResilientRedisClient = RedisCommands & {
  readonly closeConnection: () => Promise<void>;
};

export const createResilientRedisClient = async (
  config: RedisClientConfig,
): Promise<ResilientRedisClient> => {
  const commandTimeoutMs =
    config.commandTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;

  let client = await createRedisClient(config);
  let reconnecting: null | Promise<RedisClient> = null;
  let consecutiveFailures = 0;
  let nextReconnectAt = 0;
  let closed = false;

  const reconnect = (): Promise<RedisClient> => {
    if (reconnecting !== null) {
      return reconnecting;
    }
    if (Date.now() < nextReconnectAt) {
      return Promise.reject(
        new Error("Redis reconnection failed, retrying shortly"),
      );
    }
    // destroy() never waits on the network, unlike quit()/close().
    client.destroy();
    reconnecting = createRedisClient(config)
      .then(
        (newClient) => {
          client = newClient;
          consecutiveFailures = 0;
          return newClient;
        },
        (error: unknown) => {
          nextReconnectAt = Date.now() + RECONNECT_BACKOFF_MS;
          throw error;
        },
      )
      .finally(() => {
        reconnecting = null;
      });
    return reconnecting;
  };

  const getClient = (): Promise<RedisClient> => {
    if (closed) {
      return Promise.reject(new Error("Redis client is closed"));
    }
    if (
      reconnecting === null &&
      client.isOpen &&
      consecutiveFailures < MAX_CONSECUTIVE_FAILURES
    ) {
      return Promise.resolve(client);
    }
    return reconnect();
  };

  const run = <T>(command: (c: RedisClient) => Promise<T>): Promise<T> =>
    withDeadline(commandTimeoutMs, "command", async (signal) => {
      const c = await getClient();
      // The caller has already received a timeout: do not run it late.
      signal.throwIfAborted();
      return command(c);
    }).then(
      (result) => {
        consecutiveFailures = 0;
        return result;
      },
      (error: unknown) => {
        consecutiveFailures += 1;
        throw error;
      },
    );

  return {
    closeConnection: async () => {
      closed = true;
      await reconnecting?.catch(() => undefined);
      await client.closeConnection();
    },
    del: (key) => run((c) => c.del(key)),
    get: (key) => run((c) => c.get(key)),
    ping: () => run((c) => c.ping()),
    set: (key, value) => run((c) => c.set(key, value)),
    setEx: (key, seconds, value) => run((c) => c.setEx(key, seconds, value)),
  };
};
