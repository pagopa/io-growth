import type { NewPlace } from "../../../domain/entities/place.js";

import { dbClient } from "./client.js";
import { address, place, supportContact, website } from "./schema/tables.js";

type DbClient = typeof dbClient;
type TransactionClient = Parameters<Parameters<DbClient["transaction"]>[0]>[0];

/**
 * Creates a place with its type-specific details and support contacts
 * inside an existing transaction and returns the created place ID.
 */
export const createPlaceInTransaction = async (
  tx: TransactionClient,
  operatorId: string,
  input: NewPlace,
): Promise<string> => {
  const [createdPlace] = await tx
    .insert(place)
    .values({
      name: input.name,
      operatorId,
      type: input.type,
    })
    .returning({ id: place.id });

  if (input.type === "offline") {
    await tx.insert(address).values({
      city: input.address.city,
      country: input.address.country,
      placeId: createdPlace.id,
      postalCode: input.address.postalCode,
      state: input.address.state,
      street: input.address.street,
    });
  }

  if (input.type === "online") {
    await tx.insert(website).values({
      placeId: createdPlace.id,
      url: input.website.url,
    });
  }

  if (input.supportContacts.length > 0) {
    await tx.insert(supportContact).values(
      input.supportContacts.map((sc) => ({
        placeId: createdPlace.id,
        type: sc.type,
        value: sc.value,
      })),
    );
  }

  return createdPlace.id;
};
