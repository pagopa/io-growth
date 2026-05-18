import { configDefaults, defineConfig } from "vitest/config";

const coverageExclude = [
  ...configDefaults.exclude,
  "src/**/__tests__/**",
  "src/**/*.d.ts",
  "src/**/index.ts",
  "src/main.ts",
  "dist/**",
  "node_modules/**",
];

export default defineConfig({
  test: {
    coverage: {
      all: true,
      exclude: coverageExclude,
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    globals: false,
    include: ["src/**/*.test.ts"],
  },
});
