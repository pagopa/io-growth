import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  CheckDomandaRequest,
  CheckDomandaResponse,
  ConfermaDomandaRequest,
  ConfermaDomandaResponse,
  FornisciFotoRequest,
  FornisciFotoResponse,
  NuovaDomandaInBozzaRequest,
  NuovaDomandaInBozzaResponse,
  RecuperoDatiDomandaRequest,
  RecuperoDatiDomandaResponse,
  RichiediRicevutaRequest,
  RichiediRicevutaResponse,
  RichiediRiepilogoRequest,
  RichiediRiepilogoResponse,
  RichiediStatoRequest,
  RichiediStatoResponse,
} from "../../../generated/model/index.js";

export interface GestioneDomandaCedRepository {
  readonly checkDomanda: (
    request: CheckDomandaRequest,
    identity: { codiceUfficio?: string; userId: string },
  ) => Promise<Result<CheckDomandaResponse, BaseError>>;

  readonly confermaDomanda: (
    request: ConfermaDomandaRequest,
    identity: { codiceUfficio?: string; userId: string },
    opts: IdempotencyOptions,
  ) => Promise<Result<ConfermaDomandaResponse, BaseError>>;

  readonly fornisciFoto: (
    request: FornisciFotoRequest,
    identity: { codiceUfficio?: string; userId: string },
    opts: IdempotencyOptions,
  ) => Promise<Result<FornisciFotoResponse, BaseError>>;

  readonly nuovaDomandaInBozza: (
    request: NuovaDomandaInBozzaRequest,
    identity: { codiceUfficio?: string; userId: string },
    opts: IdempotencyOptions,
  ) => Promise<Result<NuovaDomandaInBozzaResponse, BaseError>>;

  readonly recuperoDatiDomanda: (
    request: RecuperoDatiDomandaRequest,
    identity: { codiceUfficio?: string; userId: string },
  ) => Promise<Result<RecuperoDatiDomandaResponse, BaseError>>;

  readonly richiediRicevuta: (
    request: RichiediRicevutaRequest,
    identity: { codiceUfficio?: string; userId: string },
  ) => Promise<Result<RichiediRicevutaResponse, BaseError>>;

  readonly richiediRiepilogo: (
    request: RichiediRiepilogoRequest,
    identity: { codiceUfficio?: string; userId: string },
  ) => Promise<Result<RichiediRiepilogoResponse, BaseError>>;

  readonly richiediStato: (
    request: RichiediStatoRequest,
    identity: { codiceUfficio?: string; userId: string },
  ) => Promise<Result<RichiediStatoResponse, BaseError>>;
}

export interface IdempotencyOptions {
  readonly idempotencyKey: string;
}
