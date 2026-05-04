import type {
  ConflictError,
  GenericError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError as GenericErrorClass } from "@pagopa/io-core-domain/errors";
import { eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OperatorPlace } from "../../../domain/entities/place.js";
import type {
  CreateProfileInput,
  Profile,
} from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { dbClient } from "./client.js";
import {
  address,
  place,
  profile,
  supportContact,
  website,
} from "./schema/tables.js";

type DbClient = typeof dbClient;

export const createDrizzleProfileRepository = (
  db: DbClient,
): ProfileRepository => ({
  create: async (
    input: CreateProfileInput,
  ): Promise<Result<void, ConflictError | GenericError>> => {
    try {
      await db.transaction(async (tx) => {
        const [createdPlace] = await tx
          .insert(place)
          .values({
            name: input.place.name,
            operatorId: input.operatorId,
            type: input.place.type,
          })
          .returning({ id: place.id });

        if (input.place.type === "offline") {
          await tx.insert(address).values({
            city: input.place.address.city,
            country: input.place.address.country,
            placeId: createdPlace.id,
            postalCode: input.place.address.postalCode,
            // state is a DB-only column not exposed in the domain model
            state: "",
            street: input.place.address.street,
          });
        }

        if (input.place.type === "online") {
          await tx.insert(website).values({
            placeId: createdPlace.id,
            url: input.place.website,
          });
        }

        if (input.place.supportContacts.length > 0) {
          await tx.insert(supportContact).values(
            input.place.supportContacts.map((sc) => ({
              placeId: createdPlace.id,
              type: sc.type,
              value: sc.value,
            })),
          );
        }

        await tx.insert(profile).values({
          displayName: input.displayName,
          operatorId: input.operatorId,
          placeId: createdPlace.id,
        });
      });

      return ok(undefined);
    } catch (error) {
      return err(
        new GenericErrorClass(
          `Failed to create operator profile: ${String(error)}`,
        ),
      );
    }
  },

  getByOperatorId: async (
    operatorId: string,
  ): Promise<Result<Profile | undefined, GenericError>> => {
    try {
      const profileRows = await db
        .select({
          displayName: profile.displayName,
          placeId: profile.placeId,
        })
        .from(profile)
        .where(eq(profile.operatorId, operatorId))
        .limit(1);

      if (profileRows.length === 0) {
        return ok(undefined);
      }

      const profileRow = profileRows[0];

      const placeRows = await db
        .select({
          id: place.id,
          name: place.name,
          type: place.type,
        })
        .from(place)
        .where(eq(place.id, profileRow.placeId))
        .limit(1);

      if (placeRows.length === 0) {
        return err(
          new GenericErrorClass(
            `Data integrity error: profile for operator ${operatorId} references a missing place`,
          ),
        );
      }

      const placeRow = placeRows[0];

      const contacts = await db
        .select({
          type: supportContact.type,
          value: supportContact.value,
        })
        .from(supportContact)
        .where(eq(supportContact.placeId, placeRow.id));

      let operatorPlace: OperatorPlace;

      if (placeRow.type === "offline") {
        const addressRows = await db
          .select({
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
            street: address.street,
          })
          .from(address)
          .where(eq(address.placeId, placeRow.id))
          .limit(1);

        operatorPlace = {
          address: addressRows[0] ?? {
            city: "",
            country: "",
            postalCode: "",
            street: "",
          },
          name: placeRow.name,
          supportContacts: contacts,
          type: "offline",
        };
      } else {
        const websiteRows = await db
          .select({ url: website.url })
          .from(website)
          .where(eq(website.placeId, placeRow.id))
          .limit(1);

        operatorPlace = {
          name: placeRow.name,
          supportContacts: contacts,
          type: "online",
          website: websiteRows[0]?.url ?? "",
        };
      }

      return ok({
        displayName: profileRow.displayName,
        place: operatorPlace,
      });
    } catch (error) {
      return err(
        new GenericErrorClass(
          `Failed to get operator profile: ${String(error)}`,
        ),
      );
    }
  },
});
