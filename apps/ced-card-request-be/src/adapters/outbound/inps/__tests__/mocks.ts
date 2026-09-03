import type { GestioneDomandaCedRepository } from "@pagopa/io-core-adapter-inps-ced";

import { vi } from "vitest";

export const createMockGestioneDomandaCedRepository = (
  overrides?: Partial<GestioneDomandaCedRepository>,
): GestioneDomandaCedRepository => ({
  checkDomanda: vi.fn(),
  confermaDomanda: vi.fn(),
  fornisciFoto: vi.fn(),
  nuovaDomandaInBozza: vi.fn(),
  recuperoDatiDomanda: vi.fn(),
  richiediRicevuta: vi.fn(),
  richiediRiepilogo: vi.fn(),
  richiediStato: vi.fn(),
  ...overrides,
});
