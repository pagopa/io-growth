import { describe, expect, it } from "vitest";

import {
  azureTracingConfigSchema,
  buildAzureTracingConfig,
} from "../config.js";

describe("Azure Tracing Config", () => {
  describe("azureTracingConfigSchema", () => {
    it("should parse valid environment variables", () => {
      const env = {
        APPINSIGHTS_INSTRUMENTATION_KEY: "550e8400-e29b-41d4-a716-446655440000",
        APPINSIGHTS_SAMPLING_PERCENTAGE: "10",
      };
      const result = azureTracingConfigSchema.parse(env);
      expect(result.APPINSIGHTS_INSTRUMENTATION_KEY).toBe(
        "550e8400-e29b-41d4-a716-446655440000",
      );
      expect(result.APPINSIGHTS_SAMPLING_PERCENTAGE).toBe(10);
    });

    it("should use default sampling percentage when not provided", () => {
      const env = {
        APPINSIGHTS_INSTRUMENTATION_KEY: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = azureTracingConfigSchema.parse(env);
      expect(result.APPINSIGHTS_SAMPLING_PERCENTAGE).toBe(5);
    });

    it("should allow omitting instrumentation key", () => {
      const env = { APPINSIGHTS_SAMPLING_PERCENTAGE: "50" };
      const result = azureTracingConfigSchema.parse(env);
      expect(result.APPINSIGHTS_INSTRUMENTATION_KEY).toBeUndefined();
      expect(result.APPINSIGHTS_SAMPLING_PERCENTAGE).toBe(50);
    });

    it("should reject invalid instrumentation key (not a UUID)", () => {
      const env = {
        APPINSIGHTS_INSTRUMENTATION_KEY: "not-a-uuid",
      };
      expect(() => azureTracingConfigSchema.parse(env)).toThrow();
    });

    it("should reject sampling percentage below 0", () => {
      const env = {
        APPINSIGHTS_INSTRUMENTATION_KEY: "550e8400-e29b-41d4-a716-446655440000",
        APPINSIGHTS_SAMPLING_PERCENTAGE: "-1",
      };
      expect(() => azureTracingConfigSchema.parse(env)).toThrow();
    });

    it("should reject sampling percentage above 100", () => {
      const env = {
        APPINSIGHTS_INSTRUMENTATION_KEY: "550e8400-e29b-41d4-a716-446655440000",
        APPINSIGHTS_SAMPLING_PERCENTAGE: "101",
      };
      expect(() => azureTracingConfigSchema.parse(env)).toThrow();
    });

    it("should parse Entra ID auth enabled flag", () => {
      const env = {
        APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: "true",
      };
      const result = azureTracingConfigSchema.parse(env);
      expect(result.APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED).toBe(true);
    });

    it("should parse Entra ID auth disabled flag", () => {
      const env = {
        APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: "false",
      };
      const result = azureTracingConfigSchema.parse(env);
      expect(result.APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED).toBe(false);
    });
  });

  describe("buildAzureTracingConfig", () => {
    it("should build config from validated env vars with service name", () => {
      const env = azureTracingConfigSchema.parse({
        APPINSIGHTS_INSTRUMENTATION_KEY: "550e8400-e29b-41d4-a716-446655440000",
        APPINSIGHTS_SAMPLING_PERCENTAGE: "20",
        APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: "true",
      });

      const config = buildAzureTracingConfig(env, "my-service");

      expect(config.connectionString).toBe(
        "InstrumentationKey=550e8400-e29b-41d4-a716-446655440000",
      );
      expect(config.samplingRatio).toBe(0.2);
      expect(config.entraIdAuthEnabled).toBe(true);
      expect(config.serviceName).toBe("my-service");
    });

    it("should build config without connection string when key is missing", () => {
      const env = azureTracingConfigSchema.parse({
        APPINSIGHTS_SAMPLING_PERCENTAGE: "15",
      });

      const config = buildAzureTracingConfig(env, "test-service");

      expect(config.connectionString).toBeUndefined();
      expect(config.samplingRatio).toBe(0.15);
      expect(config.entraIdAuthEnabled).toBe(false);
      expect(config.serviceName).toBe("test-service");
    });

    it("should build config with default sampling ratio", () => {
      const env = azureTracingConfigSchema.parse({});

      const config = buildAzureTracingConfig(env);

      expect(config.samplingRatio).toBe(0.05); // Default 5%
      expect(config.entraIdAuthEnabled).toBe(false);
      expect(config.serviceName).toBeUndefined();
    });

    it("should convert sampling percentage to ratio correctly", () => {
      const testCases = [
        { expected: 0, percentage: 0 },
        { expected: 0.01, percentage: 1 },
        { expected: 0.5, percentage: 50 },
        { expected: 1, percentage: 100 },
      ];

      testCases.forEach(({ expected, percentage }) => {
        const env = azureTracingConfigSchema.parse({
          APPINSIGHTS_SAMPLING_PERCENTAGE: String(percentage),
        });
        const config = buildAzureTracingConfig(env);
        expect(config.samplingRatio).toBe(expected);
      });
    });

    it("should omit service name when not provided", () => {
      const env = azureTracingConfigSchema.parse({});
      const config = buildAzureTracingConfig(env);
      expect(config.serviceName).toBeUndefined();
    });

    it("should respect Entra ID auth flag", () => {
      const env1 = azureTracingConfigSchema.parse({
        APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: "true",
      });
      expect(buildAzureTracingConfig(env1).entraIdAuthEnabled).toBe(true);

      const env2 = azureTracingConfigSchema.parse({
        APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: "false",
      });
      expect(buildAzureTracingConfig(env2).entraIdAuthEnabled).toBe(false);
    });
  });
});
