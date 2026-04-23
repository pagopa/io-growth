import { DefaultAzureCredential } from "@azure/identity";
import postgres from "postgres";

export interface DrizzleConnectionConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly useEntraId?: boolean;
  readonly user: string;
}

export type SqlClient = ReturnType<typeof postgres>;

const ENTRA_PG_SCOPE = "https://ossrdbms-aad.database.windows.net/.default";

const getEntraIdPassword = async (): Promise<string> => {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken(ENTRA_PG_SCOPE);
  return token.token;
};

export const createPostgresClient = async (
  config: DrizzleConnectionConfig,
): Promise<SqlClient> => {
  const password = config.useEntraId
    ? await getEntraIdPassword()
    : config.password;

  return postgres({
    database: config.database,
    host: config.host,
    max: 1,
    password,
    port: config.port,
    ssl: config.useEntraId || config.ssl ? "require" : false,
    user: config.user,
  });
};
