import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Place } from "../../../entities/place.js";

export interface CreatePlaceInput {
  operatorId: string;
  place: Place;
}

export interface GetPlaceByIdInput {
  operatorId: string;
  placeId: string;
}

export interface GetPlaceIdsByOperatorInput {
  operatorId: string;
  placeIds: readonly string[];
}

export interface PlaceRepository {
  readonly create: (
    input: CreatePlaceInput,
  ) => Promise<Result<void, GenericError>>;
  readonly getById: (
    input: GetPlaceByIdInput,
  ) => Promise<Result<Place | undefined, GenericError>>;
  readonly getIdsByOperator: (
    input: GetPlaceIdsByOperatorInput,
  ) => Promise<Result<string[], GenericError>>;
  readonly listByOperatorId: (
    operatorId: string,
  ) => Promise<Result<Place[], GenericError>>;
}
