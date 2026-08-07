import type { GestioneDomandaCedRepository } from "@pagopa/io-core-adapter-inps-ced";

import type { CardApplicationRepository } from "../../../domain/ports/outbound/card-application.repository.js";

import {
  toApplicationConfirmed,
  toApplicationDraftCreated,
  toApplicationStateCheck,
  toConfermaDomandaRequest,
  toFornisciFotoRequest,
  toNuovaDomandaInBozzaRequest,
} from "./inps-card-application.mapper.js";

export const createInpsCardApplicationRepository = (
  gestioneDomandaCedRepository: GestioneDomandaCedRepository,
): CardApplicationRepository => ({
  checkApplicationState: async (codiceFiscale) => {
    const result = await gestioneDomandaCedRepository.checkDomanda({
      codiceFiscale,
    });

    return result.andThen(toApplicationStateCheck);
  },

  confirmApplication: async (confirmation, opts) => {
    const result = await gestioneDomandaCedRepository.confermaDomanda(
      toConfermaDomandaRequest(confirmation),
      opts,
    );

    return result.map(toApplicationConfirmed);
  },

  createApplicationDraft: async (draft, opts) => {
    const result = await gestioneDomandaCedRepository.nuovaDomandaInBozza(
      toNuovaDomandaInBozzaRequest(draft),
      opts,
    );

    return result.map(toApplicationDraftCreated);
  },

  uploadPhoto: async (photo, opts) => {
    const result = await gestioneDomandaCedRepository.fornisciFoto(
      toFornisciFotoRequest(photo),
      opts,
    );

    return result.map(() => undefined);
  },
});
