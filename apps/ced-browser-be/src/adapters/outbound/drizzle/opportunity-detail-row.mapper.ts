import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok, type Result } from "neverthrow";

import type {
  OpportunityBenefit,
  OpportunityDetail,
  OpportunityPlace,
  OpportunityProfile,
} from "../../../domain/entities/opportunity.js";
import type { Language } from "../../../domain/ports/outbound/persistence/place.repository.js";

export interface OpportunityDetailRow {
  beneficiaryBenefit: BenefitRow | null;
  caregiverBenefit: BenefitRow | null;
  category: null | { title: string };
  dateFrom: string;
  dateTo: null | string;
  id: string;
  localizedMetadata: LocalizedMetadataRow[];
  nationalTerritory: boolean;
  operator: null | {
    profile: null | ProfileRow;
  };
  opportunityPlaces: OpportunityPlaceRow[];
  url: null | string;
}

interface BenefitRow {
  discountType: "fixed_amount" | "percentage" | null;
  type: "discount" | "free" | "other" | "priority" | "reduced_fixed_price";
  value: null | number;
}

interface LocalizedMetadataRow {
  key: "condition" | "description" | "name";
  language: Language;
  value: string;
}

interface OpportunityPlaceRow {
  place: {
    address: null | {
      city: string;
      country: string;
      postalCode: string;
      state: string;
      street: string;
    };
    id: string;
    name: string;
    type: "offline" | "online";
    website: null | {
      url: string;
    };
  };
}

interface ProfilePlaceRow {
  address: null | {
    city: string;
    postalCode: string;
    state: string;
    street: string;
  };
  id: string;
  name: string;
  type: "offline" | "online";
}

interface ProfileRow {
  displayName: string;
  id: string;
  place: null | ProfilePlaceRow;
}

type ProfileWithPlace = ProfileRow & { place: ProfilePlaceRow };

const mapBenefitRow = (row: BenefitRow): OpportunityBenefit => ({
  discountType: row.discountType,
  type: row.type,
  value: row.value,
});

const candidateLanguages = (
  requestedLanguage: Language,
  localizedMetadata: LocalizedMetadataRow[],
): Language[] => {
  const languages = new Set<Language>();

  languages.add(requestedLanguage);
  languages.add("it");
  localizedMetadata.forEach((item) => languages.add(item.language));

  return [...languages];
};

const resolveLocalizedFields = (
  localizedMetadata: LocalizedMetadataRow[],
  requestedLanguage: Language,
):
  | undefined
  | {
      condition?: string;
      description: string;
      language: Language;
      name: string;
    } => {
  for (const language of candidateLanguages(
    requestedLanguage,
    localizedMetadata,
  )) {
    const values = localizedMetadata
      .filter((item) => item.language === language)
      .reduce<Partial<Record<LocalizedMetadataRow["key"], string>>>(
        (accumulator, item) => ({
          ...accumulator,
          [item.key]: item.value,
        }),
        {},
      );

    if (values.name && values.description) {
      return {
        ...(values.condition ? { condition: values.condition } : {}),
        description: values.description,
        language,
        name: values.name,
      };
    }
  }

  return undefined;
};

const mapPlaceRow = (row: OpportunityPlaceRow): OpportunityPlace => ({
  city: row.place.address?.city ?? null,
  country: row.place.address?.country ?? null,
  id: row.place.id,
  name: row.place.name,
  postalCode: row.place.address?.postalCode ?? null,
  state: row.place.address?.state ?? null,
  street: row.place.address?.street ?? null,
  type: row.place.type,
  url: row.place.type === "online" ? (row.place.website?.url ?? null) : null,
});

const mapProfileRow = (row: ProfileWithPlace): OpportunityProfile => ({
  displayName: row.displayName,
  id: row.id,
  place: {
    address: row.place.address
      ? {
          city: row.place.address.city,
          postalCode: row.place.address.postalCode,
          state: row.place.address.state,
          street: row.place.address.street,
        }
      : null,
    id: row.place.id,
    name: row.place.name,
    type: row.place.type,
  },
});

export const mapOpportunityDetailRow = (
  row: OpportunityDetailRow,
  requestedLanguage: Language,
): Result<OpportunityDetail, GenericError> => {
  if (!row.beneficiaryBenefit) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has no beneficiary benefit`,
      ),
    );
  }

  if (!row.category) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has no category`,
      ),
    );
  }

  const localizedFields = resolveLocalizedFields(
    row.localizedMetadata,
    requestedLanguage,
  );
  if (!localizedFields) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has no localized name/description`,
      ),
    );
  }

  const places = row.opportunityPlaces.map(mapPlaceRow);
  if (places.length === 0) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has no associated places`,
      ),
    );
  }

  const profile = row.operator?.profile;
  if (!profile) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} has no associated profile`,
      ),
    );
  }
  if (!profile.place) {
    return err(
      new GenericError(
        `Data integrity error: opportunity ${row.id} profile ${profile.id} has no associated place`,
      ),
    );
  }

  return ok({
    beneficiaryBenefit: mapBenefitRow(row.beneficiaryBenefit),
    caregiverBenefit: row.caregiverBenefit
      ? mapBenefitRow(row.caregiverBenefit)
      : null,
    category: row.category.title,
    ...(localizedFields.condition
      ? { condition: localizedFields.condition }
      : {}),
    dateFrom: row.dateFrom,
    dateTo: row.dateTo,
    description: localizedFields.description,
    id: row.id,
    language: localizedFields.language,
    name: localizedFields.name,
    nationalTerritory: row.nationalTerritory,
    places,
    profile: mapProfileRow({ ...profile, place: profile.place }),
    url: row.url,
  });
};
