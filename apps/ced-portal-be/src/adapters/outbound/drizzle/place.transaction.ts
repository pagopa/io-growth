import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { and, eq } from "drizzle-orm";

import type { Place } from "../../../domain/entities/place.js";
import type {
  DeletePlaceInput,
  UpdatePlaceInput,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

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

export const doPlaceUpdate = async (
  tx: TransactionClient,
  input: UpdatePlaceInput,
): Promise<void> => {
  await tx
    .update(place)
    .set({
      name: input.place.name,
      type: input.place.type,
      updatedAt: new Date(),
    })
    .where(
      and(eq(place.id, input.placeId), eq(place.operatorId, input.operatorId)),
    );

  if (input.place.type === "offline") {
    await tx
      .insert(address)
      .values({
        city: input.place.address.city,
        country: input.place.address.country,
        placeId: input.placeId,
        postalCode: input.place.address.postalCode,
        state: input.place.address.state,
        street: input.place.address.street,
      })
      .onConflictDoUpdate({
        set: {
          city: input.place.address.city,
          country: input.place.address.country,
          postalCode: input.place.address.postalCode,
          state: input.place.address.state,
          street: input.place.address.street,
          updatedAt: new Date(),
        },
        target: address.placeId,
      });

    // current type is offline — drop any stale website row
    await tx.delete(website).where(eq(website.placeId, input.placeId));
  }

  if (input.place.type === "online") {
    await tx
      .insert(website)
      .values({ placeId: input.placeId, url: input.place.website.url })
      .onConflictDoUpdate({
        set: { updatedAt: new Date(), url: input.place.website.url },
        target: website.placeId,
      });

    // current type is online — drop any stale address row
    await tx.delete(address).where(eq(address.placeId, input.placeId));
  }

  await tx
    .delete(supportContact)
    .where(eq(supportContact.placeId, input.placeId));
  if (input.place.supportContacts.length > 0) {
    await tx.insert(supportContact).values(
      input.place.supportContacts.map((sc) => ({
        id: sc.id,
        placeId: input.placeId,
        type: sc.type,
        value: sc.value,
      })),
    );
  }
};

export const doPlaceDelete = async (
  tx: TransactionClient,
  input: DeletePlaceInput,
): Promise<void> => {
  // no CASCADE in DB — delete children before the place row
  await tx
    .delete(supportContact)
    .where(eq(supportContact.placeId, input.placeId));
  await tx.delete(address).where(eq(address.placeId, input.placeId));
  await tx.delete(website).where(eq(website.placeId, input.placeId));

  await tx
    .delete(place)
    .where(
      and(eq(place.id, input.placeId), eq(place.operatorId, input.operatorId)),
    );
};
