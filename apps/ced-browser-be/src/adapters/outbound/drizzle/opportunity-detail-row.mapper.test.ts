import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
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
  operator: {
    profile: {
      displayName: "Comune di Alessandria",
      id: "profile-id",
      place: {
        address: {
          city: "Alessandria",
          postalCode: "15121",
          state: "AL",
          street: "Piazza della Liberta 1",
        },
        id: "profile-place-id",
        name: "Sportello CED",
        type: "offline",
      },
    },
  },
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

  it("maps the operator profile and its place", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        localizedMetadata: [
          { key: "name", language: "it", value: "Nome italiano" },
          { key: "description", language: "it", value: "Descrizione italiana" },
        ],
      },
      "it",
    );

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          profile: {
            displayName: "Comune di Alessandria",
            id: "profile-id",
            place: {
              address: {
                city: "Alessandria",
                postalCode: "15121",
                state: "AL",
                street: "Piazza della Liberta 1",
              },
              id: "profile-place-id",
              name: "Sportello CED",
              type: "offline",
            },
          },
        }),
      ),
    );
  });

  it("returns a data integrity error when the profile is missing", () => {
    const result = mapOpportunityDetailRow(
      {
        ...baseRow,
        localizedMetadata: [
          { key: "name", language: "it", value: "Nome italiano" },
          { key: "description", language: "it", value: "Descrizione italiana" },
        ],
        operator: { profile: null },
      },
      "it",
    );

    expect(result).toEqual(err(expect.any(GenericError)));
  });
});
