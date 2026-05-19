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
 */
export const createPlaceInTransaction = async (
  tx: TransactionClient,
  operatorId: string,
  input: Place,
): Promise<void> => {
  await tx.insert(place).values({
    id: input.id,
    name: input.name,
    operatorId,
    type: input.type,
  });

  if (input.type === "offline") {
    await tx.insert(address).values({
      city: input.address.city,
      country: input.address.country,
      placeId: input.id,
      postalCode: input.address.postalCode,
      state: input.address.state,
      street: input.address.street,
    });
  }

  if (input.type === "online") {
    await tx.insert(website).values({
      placeId: input.id,
      url: input.website.url,
    });
  }

  if (input.supportContacts.length > 0) {
    await tx.insert(supportContact).values(
      input.supportContacts.map((sc) => ({
        id: sc.id,
        placeId: input.id,
        type: sc.type,
        value: sc.value,
      })),
    );
  }
};
