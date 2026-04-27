import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    database: process.env.POSTGRES_DB ?? "postgres",
    host: process.env.POSTGRES_HOST ?? "localhost",
    password: process.env.POSTGRES_PASSWORD ?? "postgres",
    port: Number(process.env.POSTGRES_PORT ?? "5432"),
    ssl: false,
    user: process.env.POSTGRES_USER ?? "postgres",
  },
  dialect: "postgresql",
  out: "./drizzle/migrations",
});
