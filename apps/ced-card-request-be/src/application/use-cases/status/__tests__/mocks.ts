import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SupportRecordRepository } from "../../../../domain/ports/outbound/persistence/support-record.repository.js";

export const createMockSupportRecordRepository = (
  overrides?: Partial<SupportRecordRepository>,
): SupportRecordRepository => ({
  getByCodiceFiscale: vi.fn().mockResolvedValue(ok(undefined)),
  save: vi.fn().mockImplementation((record) => Promise.resolve(ok(record))),
  ...overrides,
});
