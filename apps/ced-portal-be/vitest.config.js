import { configDefaults, defineConfig } from "vitest/config";

const coverageExclude = [
  ...configDefaults.exclude,
  "src/**/__tests__/**",
  "src/**/*.d.ts",
  "src/**/index.ts",
  "src/main.ts",
  "src/adapters/inbound/fastify/**/*.ts",
  "src/application/use-cases/info.use-case.ts",
  "src/domain/ports/**/*.ts",
];

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: coverageExclude,
      include: ["src/**/*.ts"],
      reporter: ["text", "html"],
    },
    exclude: [...configDefaults.exclude],
    globals: true,
    typecheck: {
      ignoreSourceErrors: true,
    },
  },
});
