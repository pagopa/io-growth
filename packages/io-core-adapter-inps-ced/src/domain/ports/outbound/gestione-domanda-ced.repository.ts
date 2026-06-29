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
  ) => Promise<Result<CheckDomandaResponse, BaseError>>;

  readonly confermaDomanda: (
    request: ConfermaDomandaRequest,
    opts: IdempotencyOptions,
  ) => Promise<Result<ConfermaDomandaResponse, BaseError>>;

  readonly fornisciFoto: (
    request: FornisciFotoRequest,
    opts: IdempotencyOptions,
  ) => Promise<Result<FornisciFotoResponse, BaseError>>;

  readonly nuovaDomandaInBozza: (
    request: NuovaDomandaInBozzaRequest,
    opts: IdempotencyOptions,
  ) => Promise<Result<NuovaDomandaInBozzaResponse, BaseError>>;

  readonly recuperoDatiDomanda: (
    request: RecuperoDatiDomandaRequest,
  ) => Promise<Result<RecuperoDatiDomandaResponse, BaseError>>;

  readonly richiediRicevuta: (
    request: RichiediRicevutaRequest,
  ) => Promise<Result<RichiediRicevutaResponse, BaseError>>;

  readonly richiediRiepilogo: (
    request: RichiediRiepilogoRequest,
  ) => Promise<Result<RichiediRiepilogoResponse, BaseError>>;

  readonly richiediStato: (
    request: RichiediStatoRequest,
  ) => Promise<Result<RichiediStatoResponse, BaseError>>;
}

export interface IdempotencyOptions {
  readonly idempotencyKey: string;
}
