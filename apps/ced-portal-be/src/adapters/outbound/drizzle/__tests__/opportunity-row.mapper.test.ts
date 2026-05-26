import { describe, expect, it } from "vitest";

import { mapOpportunityDetailRow } from "../opportunity-row.mapper.js";

const baseRow = {
  beneficiaryBenefit: {
    description: null,
    discountType: "percentage" as const,
    type: "discount" as const,
    value: 20,
  },
  caregiverBenefit: {
    description: null,
    discountType: null,
    type: "free" as const,
    value: null,
  },
  category: { title: "Culture" },
  categoryId: "01KRJXEYD44B58700GT982CCYY",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: "01KRJXEYD44B58700GT982CCZZ",
  localizedMetadata: [
    {
      key: "name" as const,
      language: "it" as const,
      value: "Sconto 20%",
    },
  ],
  opportunityPlaces: [{ placeId: "01JVMK3N8XQZP5T6G2WYHAB4CE" }],
  status: "draft" as const,
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  url: "https://example.org/promo",
};

describe("mapOpportunityDetailRow", () => {
  it("should return an error when caregiver benefit data is inconsistent", () => {
    const result = mapOpportunityDetailRow({
      ...baseRow,
      caregiverBenefit: {
        description: null,
        discountType: null,
        type: "discount",
        value: null,
      },
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain(
      "invalid caregiver benefit",
    );
  });

  it("should return an error when the category relation is missing", () => {
    const result = mapOpportunityDetailRow({
      ...baseRow,
      category: null,
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toContain("missing category");
  });

  it("should map valid opportunity detail rows", () => {
    const result = mapOpportunityDetailRow(baseRow);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      beneficiaryBenefit: {
        discountType: "percentage",
        type: "discount",
        value: 20,
      },
      caregiverBenefit: {
        type: "free",
      },
      categoryId: "01KRJXEYD44B58700GT982CCYY",
      categoryTitle: "Culture",
      createdAt: "2026-01-01T00:00:00.000Z",
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      id: "01KRJXEYD44B58700GT982CCZZ",
      localizedMetadata: [
        {
          key: "name",
          language: "it",
          value: "Sconto 20%",
        },
      ],
      operatorName: "",
      placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CE"],
      status: "draft",
      updatedAt: "2026-01-02T00:00:00.000Z",
      url: "https://example.org/promo",
    });
  });
});
