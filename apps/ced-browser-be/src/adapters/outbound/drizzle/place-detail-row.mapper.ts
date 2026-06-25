import type {
  PlaceBenefit,
  PlaceDetail,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

interface OpportunityRow {
  benefitDiscountType: null | string;
  benefitType: string;
  benefitValue: null | number;
  opportunityId: null | string;
  title: null | string;
}

interface PlaceRow {
  address?: null | {
    city: string;
    postalCode: string;
    state: string;
    street: string;
  };
  id: string;
  name: string;
  operator?: null | {
    name: string;
    profile?: null | { displayName: string; id: string };
  };
  operatorId: string;
  supportContacts: { type: string; value: string }[];
  type: string;
  website?: null | { url: string };
}

interface RelatedRow {
  address?: null | {
    city: string;
    postalCode: string;
    state: string;
    street: string;
  };
  id: string;
  name: string;
}

export const mapPlaceDetailRow = (
  placeRow: PlaceRow,
  opportunityRows: OpportunityRow[],
  relatedRows: RelatedRow[],
): PlaceDetail => {
  const phone = placeRow.supportContacts.find(
    (sc) => sc.type === "phone",
  )?.value;
  const website =
    placeRow.type === "online"
      ? (placeRow.website?.url ?? undefined)
      : placeRow.supportContacts.find((sc) => sc.type === "website")?.value;

  return {
    address: placeRow.address
      ? {
          city: placeRow.address.city,
          postalCode: placeRow.address.postalCode,
          state: placeRow.address.state,
          street: placeRow.address.street,
        }
      : null,
    contacts: {
      ...(phone !== undefined ? { phone } : {}),
      ...(website !== undefined ? { website } : {}),
    },
    entityId: placeRow.operator?.profile?.id ?? "",
    entityName:
      placeRow.operator?.profile?.displayName ?? placeRow.operator?.name ?? "",
    id: placeRow.id,
    opportunities: opportunityRows
      .filter(
        (row): row is OpportunityRow & { opportunityId: string } =>
          row.opportunityId !== null,
      )
      .map((row) => ({
        benefit: {
          discountType:
            (row.benefitDiscountType as PlaceBenefit["discountType"]) ?? null,
          type: row.benefitType as PlaceBenefit["type"],
          value: row.benefitValue ?? null,
        },
        id: row.opportunityId,
        title: row.title ?? "",
      })),
    relatedPlaces: relatedRows.map((row) => ({
      address: row.address
        ? {
            city: row.address.city,
            postalCode: row.address.postalCode,
            state: row.address.state,
            street: row.address.street,
          }
        : null,
      id: row.id,
      title: row.name,
    })),
    title: placeRow.name,
  };
};
