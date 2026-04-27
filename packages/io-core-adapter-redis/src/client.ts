import { createClient } from "redis";

export type RedisClient = RedisClientInstance & {
  readonly closeConnection: () => Promise<void>;
};

export interface RedisClientConfig {
  readonly database?: number;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly tls?: boolean;
}

export type RedisClientInstance = ReturnType<typeof createClient>;

export interface RedisCommands {
  del(key: string): Promise<number>;
  get(key: string): Promise<null | string>;
  set(key: string, value: string): Promise<unknown>;
  setEx(key: string, seconds: number, value: string): Promise<unknown>;
}

export const createRedisClient = async (
  config: RedisClientConfig,
): Promise<RedisClient> => {
  const client = createClient({
    database: config.database,
    password: config.password,
    socket: {
      host: config.host,
      port: config.port,
      ...(config.tls ? { tls: true as const } : {}),
    },
  });

  await client.connect();

  return Object.assign(client, {
    closeConnection: () => client.quit().then(() => undefined),
  });
};
