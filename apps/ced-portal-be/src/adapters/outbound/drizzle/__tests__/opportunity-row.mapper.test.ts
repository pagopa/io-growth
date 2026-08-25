import { ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import {
  mapOpportunityDetailRow,
  mapOpportunitySummaryRow,
} from "../opportunity-row.mapper.js";

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
  nationalTerritory: false,
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
      nationalTerritory: false,
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
      nationalTerritory: false,
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
      deletionMessage: null,
      id: "01KRJXEYD44B58700GT982CCZZ",
      localizedMetadata: [
        {
          key: "name",
          language: "it",
          value: "Sconto 20%",
        },
      ],
      nationalTerritory: false,
      placeIds: ["01JVMK3N8XQZP5T6G2WYHAB4CE"],
      status: "draft",
      suspendedBy: null,
      suspendFrom: null,
      suspensionMessage: null,
      updatedAt: "2026-01-02T00:00:00.000Z",
      url: "https://example.org/promo",
    });
  });

  it("should map the suspension fields when present", () => {
    const result = mapOpportunityDetailRow({
      ...baseRow,
      nationalTerritory: false,
      status: "suspended",
      suspendedBy: "operator",
      suspensionMessage: "Chiuso per manutenzione",
    });

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          suspendedBy: "operator",
          suspendFrom: null,
          suspensionMessage: "Chiuso per manutenzione",
        }),
      ),
    );
  });

  it("should map a pending scheduled suspension date", () => {
    const result = mapOpportunityDetailRow({
      ...baseRow,
      nationalTerritory: false,
      status: "published",
      suspendFrom: "2026-08-01",
    });

    expect(result).toEqual(
      ok(expect.objectContaining({ suspendFrom: "2026-08-01" })),
    );
  });

  it("should report a published detail not yet effective as scheduled", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        dateFrom: "2026-12-31",
        nationalTerritory: false,
        status: "published",
      },
      "2026-06-26",
    );

    expect(result._unsafeUnwrap().status).toBe("scheduled");
  });

  it("should map the deletion message when present", () => {
    const result = mapOpportunityDetailRow({
      ...baseRow,
      deletionMessage: "Iniziativa terminata",
      nationalTerritory: false,
      status: "deleted",
    });

    expect(result).toEqual(
      ok(expect.objectContaining({ deletionMessage: "Iniziativa terminata" })),
    );
  });

  it("should default the deletion message to null when absent", () => {
    const result = mapOpportunityDetailRow(baseRow);

    expect(result).toEqual(
      ok(expect.objectContaining({ deletionMessage: null })),
    );
  });

  it("should keep an already effective published detail as published", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        dateFrom: "2026-01-01",
        nationalTerritory: false,
        status: "published",
      },
      "2026-06-26",
    );

    expect(result._unsafeUnwrap().status).toBe("published");
  });

  it("should report a live published detail with a future suspendFrom as scheduled_suspension", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        dateFrom: "2026-01-01",
        nationalTerritory: false,
        status: "published",
        suspendFrom: "2026-08-01",
      },
      "2026-06-26",
    );

    expect(result._unsafeUnwrap().status).toBe("scheduled_suspension");
  });
});

describe("mapOpportunitySummaryRow", () => {
  const baseSummaryRow = {
    categoryTitle: "Culture",
    dateFrom: "2026-01-01",
    dateTo: "2026-12-31" as null | string,
    id: "01KRJXEYD44B58700GT982CCZZ",
    name: "Sconto 20%" as null | string,
    operatorName: "Ente Demo",
    status: "published" as const,
  };

  it("should report a published summary not yet effective as scheduled", () => {
    const result = mapOpportunitySummaryRow(
      { ...baseSummaryRow, dateFrom: "2026-12-31" },
      "2026-06-26",
    );

    expect(result.status).toBe("scheduled");
  });

  it("should keep an already effective published summary as published", () => {
    const result = mapOpportunitySummaryRow(
      { ...baseSummaryRow, dateFrom: "2026-01-01" },
      "2026-06-26",
    );

    expect(result.status).toBe("published");
  });

  it("should leave non-published statuses unchanged", () => {
    const result = mapOpportunitySummaryRow(
      { ...baseSummaryRow, dateFrom: "2026-12-31", status: "draft" },
      "2026-06-26",
    );

    expect(result.status).toBe("draft");
  });

  it("should not derive scheduled without a reference date", () => {
    const result = mapOpportunitySummaryRow({
      ...baseSummaryRow,
      dateFrom: "2026-12-31",
    });

    expect(result.status).toBe("published");
  });

  it("should report a live published summary with a future suspendFrom as scheduled_suspension", () => {
    const result = mapOpportunitySummaryRow(
      { ...baseSummaryRow, dateFrom: "2026-01-01", suspendFrom: "2026-08-01" },
      "2026-06-26",
    );

    expect(result.status).toBe("scheduled_suspension");
  });

  it("should not derive scheduled_suspension without a reference date", () => {
    const result = mapOpportunitySummaryRow({
      ...baseSummaryRow,
      dateFrom: "2026-01-01",
      suspendFrom: "2026-08-01",
    });

    expect(result.status).toBe("published");
  });
});
