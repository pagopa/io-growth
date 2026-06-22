import { ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import type { OpportunityDetailRow } from "./opportunity-detail-row.mapper.js";

import { mapOpportunityDetailRow } from "./opportunity-detail-row.mapper.js";

const baseRow: OpportunityDetailRow = {
  beneficiaryBenefit: {
    discountType: "percentage",
    type: "discount",
    value: 20,
  },
  caregiverBenefit: null,
  category: { title: "Culture" },
  dateFrom: "2026-01-01",
  dateTo: null,
  id: "opportunity-id",
  localizedMetadata: [],
  nationalTerritory: false,
  opportunityPlaces: [
    {
      place: {
        address: {
          city: "Rome",
          country: "IT",
          postalCode: "00100",
          state: "Lazio",
          street: "Via Roma 1",
        },
        id: "place-id",
        name: "Place name",
        type: "offline",
        website: null,
      },
    },
  ],
  url: null,
};

describe("mapOpportunityDetailRow", () => {
  it("prefers the requested language over italian when both are available", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        localizedMetadata: [
          { key: "name", language: "it", value: "Nome italiano" },
          { key: "description", language: "it", value: "Descrizione italiana" },
          { key: "name", language: "en", value: "English name" },
          { key: "description", language: "en", value: "English description" },
        ],
      },
      "en",
    );

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          description: "English description",
          language: "en",
          name: "English name",
        }),
      ),
    );
  });

  it("falls back to italian when the requested language is incomplete", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        localizedMetadata: [
          { key: "name", language: "it", value: "Nome italiano" },
          { key: "description", language: "it", value: "Descrizione italiana" },
          { key: "name", language: "en", value: "English name" },
        ],
      },
      "en",
    );

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          description: "Descrizione italiana",
          language: "it",
          name: "Nome italiano",
        }),
      ),
    );
  });
});
