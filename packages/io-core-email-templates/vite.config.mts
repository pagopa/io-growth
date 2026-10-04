import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "dist",
        "node_modules",
        "scripts",
        "**/__mocks__/**",
        "*.js",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.config.*",
      ],
      reporter: ["lcov", "text"],
    },
    exclude: ["**/node_modules/**", "**/dist/**"],
    passWithNoTests: true,
  },
});
