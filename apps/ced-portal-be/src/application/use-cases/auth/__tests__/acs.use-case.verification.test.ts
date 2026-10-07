import {
  ServiceUnavailableError,
  UnauthorizedError,
} from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { ArTokenRepository } from "../../../../domain/ports/outbound/ar-token.repository.js";
import type { OperatorRepository } from "../../../../domain/ports/outbound/persistence/operator.repository.js";

import { makeAcsUseCase } from "../acs.use-case.js";
import { createMockSessionRepository } from "./mocks.js";

const mockConfig = {
  ADMIN_FISCAL_CODES: [] as string[],
  ADMIN_FISCAL_CODES_TEST: [] as string[],
  OPERATORS_FISCAL_CODES_TEST: [] as string[],
};

const createMockOperatorRepository = (): OperatorRepository => ({
  create: vi.fn(),
  getByExternalId: vi.fn(),
  getById: vi.fn(),
  revokeById: vi.fn(),
});

describe("makeAcsUseCase — token verification", () => {
  it.each([
    ["UnauthorizedError", new UnauthorizedError("Invalid token")],
    ["ServiceUnavailableError", new ServiceUnavailableError("jwks")],
  ])(
    "should propagate %s from the verifier without touching any repository",
    async (kind, error) => {
      const arTokenRepository: ArTokenRepository = {
        verifyToken: vi.fn().mockResolvedValue(err(error)),
      };
      const sessionRepository = createMockSessionRepository();
      const operatorRepository = createMockOperatorRepository();
      const useCase = makeAcsUseCase(
        arTokenRepository,
        sessionRepository,
        operatorRepository,
        mockConfig,
      );

      const result = await useCase({ token: "raw-token" });

      expect(result).toEqual(err(expect.objectContaining({ kind })));
      expect(arTokenRepository.verifyToken).toHaveBeenCalledWith("raw-token");
      expect(
        sessionRepository.existsRevocationByOperatorExternalId,
      ).not.toHaveBeenCalled();
      expect(sessionRepository.createSession).not.toHaveBeenCalled();
      expect(operatorRepository.getByExternalId).not.toHaveBeenCalled();
    },
  );
});
