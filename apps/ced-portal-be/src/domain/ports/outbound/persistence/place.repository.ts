import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Place } from "../../../entities/place.js";

export interface CreatePlaceInput {
  operatorId: string;
  place: Place;
}

export interface DeletePlaceInput {
  operatorId: string;
  placeId: string;
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
  ) => Promise<Result<Place, GenericError>>;
  readonly delete: (
    input: DeletePlaceInput,
  ) => Promise<Result<void, GenericError>>;
  readonly existsById: (
    input: GetPlaceByIdInput,
  ) => Promise<Result<boolean, GenericError>>;
  readonly getById: (
    input: GetPlaceByIdInput,
  ) => Promise<Result<Place | undefined, GenericError>>;
  readonly getIdsByOperator: (
    input: GetPlaceIdsByOperatorInput,
  ) => Promise<Result<string[], GenericError>>;
  readonly hasOpportunityLinks: (
    placeId: string,
  ) => Promise<Result<boolean, GenericError>>;
  readonly hasProfile: (
    input: GetPlaceByIdInput,
  ) => Promise<Result<boolean, GenericError>>;
  readonly listByOperatorId: (
    operatorId: string,
  ) => Promise<Result<Place[], GenericError>>;
  readonly update: (
    input: UpdatePlaceInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface UpdatePlaceInput {
  operatorId: string;
  place: Place;
  placeId: string;
}
