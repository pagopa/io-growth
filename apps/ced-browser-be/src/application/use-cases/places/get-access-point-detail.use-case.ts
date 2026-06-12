import type { UseCase } from "@pagopa/io-core-domain";
import type {
  GenericError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";

import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type {
  AccessPointBenefit,
  AccessPointSearchAddress,
  PlaceRepository,
  RelatedAccessPoint,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { LANGUAGE_VALUES } from "../../../domain/ports/outbound/persistence/place.repository.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const GetAccessPointDetailInputSchema = z.object({
  accessPointId: z.string().min(1),
  language: z.enum(LANGUAGE_VALUES).default("it"),
});

export type GetAccessPointDetailInput = z.input<
  typeof GetAccessPointDetailInputSchema
>;

export interface GetAccessPointDetailOutput {
  address: AccessPointSearchAddress | null;
  contacts: { phone?: string; website?: string };
  entityId: string;
  entityName: string;
  id: string;
  opportunities: { badgeLabel: string; id: string; title: string }[];
  relatedAccessPoints: RelatedAccessPoint[];
  title: string;
}

export type GetAccessPointDetailUseCase = UseCase<
  GetAccessPointDetailInput,
  GetAccessPointDetailOutput,
  GenericError | NotFoundError | ValidationError
>;

// TODO: move to FE when multi-language badgeLabel support is needed
const computeBadgeLabel = (benefit: AccessPointBenefit): string => {
  if (benefit.type === "free") return "GRATIS";
  if (benefit.type === "priority") return "PRIORITÀ";
  if (benefit.type === "reduced_fixed_price") return `${benefit.value ?? 0}€`;
  if (benefit.type === "discount") {
    if (benefit.value === null) return "ALTRO";
    return benefit.discountType === "percentage"
      ? `-${benefit.value}%`
      : `-${benefit.value}€`;
  }
  return "ALTRO";
};

export const makeGetAccessPointDetailUseCase =
  (placeRepository: PlaceRepository): GetAccessPointDetailUseCase =>
  async (input) => {
    const validatedResult = await validateUseCaseInput(
      GetAccessPointDetailInputSchema,
      input,
    );
    if (validatedResult.isErr()) return err(validatedResult.error);

    const { accessPointId, language } = validatedResult.value;

    const detailResult = await placeRepository.findById({
      language,
      placeId: accessPointId,
    });
    if (detailResult.isErr()) return err(detailResult.error);
    if (detailResult.value === undefined)
      return err(new NotFoundError("AccessPoint", accessPointId));

    const detail = detailResult.value;

    return ok({
      address: detail.address,
      contacts: detail.contacts,
      entityId: detail.entityId,
      entityName: detail.entityName,
      id: detail.id,
      opportunities: detail.opportunities.map((o) => ({
        badgeLabel: computeBadgeLabel(o.benefit),
        id: o.id,
        title: o.title,
      })),
      relatedAccessPoints: detail.relatedAccessPoints,
      title: detail.title,
    });
  };
