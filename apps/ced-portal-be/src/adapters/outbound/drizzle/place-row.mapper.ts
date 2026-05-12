import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { Place } from "../../../domain/entities/place.js";

export interface PlaceRow {
  readonly address: null | {
    readonly city: string;
    readonly country: string;
    readonly postalCode: string;
    readonly state: string;
    readonly street: string;
  };
  readonly id: string;
  readonly name: string;
  readonly supportContacts: readonly {
    readonly id: string;
    readonly type: "email" | "phone" | "website";
    readonly value: string;
  }[];
  readonly type: "offline" | "online";
  readonly website: null | { readonly url: string };
}

export const mapPlaceRow = (row: PlaceRow): Result<Place, GenericError> => {
  const supportContacts = row.supportContacts.map((sc) => ({
    id: sc.id,
    type: sc.type,
    value: sc.value,
  }));

  if (row.type === "offline") {
    if (!row.address) {
      return err(
        new GenericError(
          `Data integrity error: offline place ${row.id} is missing its address`,
        ),
      );
    }

    return ok({
      address: {
        city: row.address.city,
        country: row.address.country,
        postalCode: row.address.postalCode,
        state: row.address.state,
        street: row.address.street,
      },
      id: row.id,
      name: row.name,
      supportContacts,
      type: "offline",
    });
  }

  if (!row.website) {
    return err(
      new GenericError(
        `Data integrity error: online place ${row.id} is missing its website`,
      ),
    );
  }

  return ok({
    id: row.id,
    name: row.name,
    supportContacts,
    type: "online",
    website: { url: row.website.url },
  });
};

export const mapPlaceRows = (
  rows: PlaceRow[],
): Result<Place[], GenericError> => {
  const places: Place[] = [];
  for (const row of rows) {
    const result = mapPlaceRow(row);
    if (result.isErr()) {
      return err(result.error);
    }
    places.push(result.value);
  }
  return ok(places);
};
