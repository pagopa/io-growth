import { vi } from "vitest";

import type { CardApplicationRepository } from "../../../domain/ports/outbound/card-application.repository.js";

/**
 * Shared across every use-case slice: all four flows depend on the same
 * outbound card-application port.
 */
export const createMockCardApplicationRepository = (
  overrides?: Partial<CardApplicationRepository>,
): CardApplicationRepository => ({
  checkApplicationState: vi.fn(),
  confirmApplication: vi.fn(),
  createApplicationDraft: vi.fn(),
  recoverApplicationDraft: vi.fn(),
  uploadPhoto: vi.fn(),
  ...overrides,
});
