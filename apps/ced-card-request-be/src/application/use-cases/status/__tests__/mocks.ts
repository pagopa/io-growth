import type { GestioneDomandaCedRepository } from "@pagopa/io-core-adapter-inps-ced";

import { ok } from "neverthrow";
import { vi } from "vitest";

import type { SupportRecordRepository } from "../../../../domain/ports/outbound/persistence/support-record.repository.js";
import type { ApplicantDataResolver } from "../../../ports/applicant-data-resolver.js";

export const createMockGestioneDomandaCedRepository =
  (): GestioneDomandaCedRepository => ({
    checkDomanda: vi.fn(),
    confermaDomanda: vi.fn(),
    fornisciFoto: vi.fn(),
    nuovaDomandaInBozza: vi.fn(),
    recuperoDatiDomanda: vi.fn(),
    richiediRicevuta: vi.fn(),
    richiediRiepilogo: vi.fn(),
    richiediStato: vi.fn(),
  });

export const createMockSupportRecordRepository = (
  overrides?: Partial<SupportRecordRepository>,
): SupportRecordRepository => ({
  getByCodiceFiscale: vi.fn().mockResolvedValue(ok(undefined)),
  save: vi.fn().mockImplementation((record) => Promise.resolve(ok(record))),
  ...overrides,
});

export const createMockApplicantDataResolver = (): ApplicantDataResolver => ({
  resolve: vi.fn().mockReturnValue({
    cognome: "Rossi",
    dataNascita: "1980-01-01",
    nome: "Mario",
    sesso: "M",
  }),
});
