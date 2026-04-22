import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "dist",
        "node_modules",
        "**/__mocks__/**",
        "*.js",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.config.*",
        "src",
      ],
      reporter: ["lcov", "text"],
    },
    exclude: ["**/node_modules/**", "**/dist/**"],
    passWithNoTests: true,
  },
});
