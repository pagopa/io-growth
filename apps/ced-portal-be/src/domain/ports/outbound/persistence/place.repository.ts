import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Place, PlaceListItem } from "../../../entities/place.js";

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

export interface ListPlacesInput {
  limit: number;
  offset: number;
  operatorId: string;
  search?: string;
  type?: Place["type"];
}

export interface PaginatedPlaces {
  items: PlaceListItem[];
  total: number;
}

export interface PlaceRepository {
  readonly create: (
    input: CreatePlaceInput,
  ) => Promise<Result<Place, GenericError>>;
  readonly getById: (
    input: GetPlaceByIdInput,
  ) => Promise<Result<Place | undefined, GenericError>>;
  readonly getIdsByOperator: (
    input: GetPlaceIdsByOperatorInput,
  ) => Promise<Result<string[], GenericError>>;
  readonly listByOperatorId: (
    input: ListPlacesInput,
  ) => Promise<Result<PaginatedPlaces, GenericError>>;
}
