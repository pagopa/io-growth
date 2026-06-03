import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import type { Place } from "../../../domain/entities/place.js";

import * as schema from "./schema/index.js";
import { address, place, supportContact, website } from "./schema/tables.js";
type TransactionClient = Parameters<
  Parameters<TypedDbClient<typeof schema>["transaction"]>[0]
>[0];

/**
 * Creates a place with its type-specific details and support contacts
 * inside an existing transaction using the application-provided IDs.
 * Returns the persisted Place entity with values read back from the DB.
 */
export const createPlaceInTransaction = async (
  tx: TransactionClient,
  operatorId: string,
  input: Place,
): Promise<Place> => {
  const [placeRow] = await tx
    .insert(place)
    .values({
      id: input.id,
      name: input.name,
      operatorId,
      type: input.type,
    })
    .returning({ id: place.id, name: place.name, type: place.type });

  if (!placeRow) {
    throw new Error("Failed to insert place");
  }

  const returnedSupportContacts =
    input.supportContacts.length > 0
      ? await tx
          .insert(supportContact)
          .values(
            input.supportContacts.map((sc) => ({
              id: sc.id,
              placeId: input.id,
              type: sc.type,
              value: sc.value,
            })),
          )
          .returning({
            id: supportContact.id,
            type: supportContact.type,
            value: supportContact.value,
          })
      : [];

  if (input.type === "offline") {
    const [addressRow] = await tx
      .insert(address)
      .values({
        city: input.address.city,
        country: input.address.country,
        placeId: input.id,
        postalCode: input.address.postalCode,
        state: input.address.state,
        street: input.address.street,
      })
      .returning({
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        state: address.state,
        street: address.street,
      });

    if (!addressRow) {
      throw new Error("Failed to insert address");
    }

    return {
      address: addressRow,
      id: placeRow.id,
      name: placeRow.name,
      supportContacts: returnedSupportContacts,
      type: "offline",
    };
  }

  const [websiteRow] = await tx
    .insert(website)
    .values({
      placeId: input.id,
      url: input.website.url,
    })
    .returning({ url: website.url });

  if (!websiteRow) {
    throw new Error("Failed to insert website");
  }

  return {
    id: placeRow.id,
    name: placeRow.name,
    supportContacts: returnedSupportContacts,
    type: "online",
    website: { url: websiteRow.url },
  };
};
