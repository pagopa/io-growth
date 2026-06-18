import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type {
  PlaceAddress,
  PlaceBenefit,
  PlaceRepository,
  RelatedPlace,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { LANGUAGE_VALUES } from "../../../domain/ports/outbound/persistence/place.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetPlaceDetailInputSchema = z.object({
  language: z.enum(LANGUAGE_VALUES).default("it"),
  placeId: z.string().min(1),
});

export type GetPlaceDetailInput = z.input<typeof GetPlaceDetailInputSchema>;

export interface GetPlaceDetailOutput {
  address: null | PlaceAddress;
  contacts: { phone?: string; website?: string };
  entityId: string;
  entityName: string;
  id: string;
  opportunities: { benefit: PlaceBenefit; id: string; title: string }[];
  relatedPlaces: RelatedPlace[];
  title: string;
}

export type GetPlaceDetailUseCase = UseCase<
  GetPlaceDetailInput,
  GetPlaceDetailOutput,
  GenericError | NotFoundError | ValidationError
>;

export const makeGetPlaceDetailUseCase =
  (placeRepository: PlaceRepository): GetPlaceDetailUseCase =>
  async (input) => {
    const validatedResult = await validateUseCaseInput(
      GetPlaceDetailInputSchema,
      input,
    );
    if (validatedResult.isErr()) return err(validatedResult.error);

    const { language, placeId } = validatedResult.value;

    const detailResult = await placeRepository.findById({
      language,
      placeId,
    });
    if (detailResult.isErr()) return err(detailResult.error);
    if (detailResult.value === undefined)
      return err(new NotFoundError("Place", placeId));

    const detail = detailResult.value;

    return ok({
      address: detail.address,
      contacts: detail.contacts,
      entityId: detail.entityId,
      entityName: detail.entityName,
      id: detail.id,
      opportunities: detail.opportunities.map((o) => ({
        benefit: o.benefit,
        id: o.id,
        title: o.title,
      })),
      relatedPlaces: detail.relatedPlaces,
      title: detail.title,
    });
  };
