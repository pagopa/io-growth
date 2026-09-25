import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import { mapPlaceRow } from "./place-row.mapper.js";
import { createPlaceInTransaction } from "./place.transaction.js";
import * as schema from "./schema/index.js";
import {
  address,
  place,
  profile,
  supportContact,
  website,
} from "./schema/tables.js";

const updateByOperatorId =
  (db: TypedDbClient<typeof schema>) =>
  async (
    input: Profile,
  ): Promise<Result<Profile | undefined, GenericError>> => {
    try {
      let updated: Profile | undefined;

      await db.transaction(async (tx) => {
        const [profileRow] = await tx
          .update(profile)
          .set({
            contactEmail: input.contactEmail,
            displayName: input.displayName,
            updatedAt: new Date(),
          })
          .where(eq(profile.operatorId, input.operatorId))
          .returning({
            contactEmail: profile.contactEmail,
            displayName: profile.displayName,
            operatorId: profile.operatorId,
            placeId: profile.placeId,
          });

        if (!profileRow) {
          return;
        }

        const [placeRow] = await tx
          .update(place)
          .set({
            name: input.place.name,
            type: input.place.type,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(place.id, profileRow.placeId),
              eq(place.operatorId, input.operatorId),
            ),
          )
          .returning({ id: place.id, name: place.name, type: place.type });

        if (!placeRow) {
          throw new Error(
            `Profile for operator ${input.operatorId} references a missing place`,
          );
        }

        await tx.delete(address).where(eq(address.placeId, placeRow.id));
        await tx.delete(website).where(eq(website.placeId, placeRow.id));
        await tx
          .delete(supportContact)
          .where(eq(supportContact.placeId, placeRow.id));

        const returnedSupportContacts =
          input.place.supportContacts.length > 0
            ? await tx
                .insert(supportContact)
                .values(
                  input.place.supportContacts.map((item) => ({
                    id: item.id,
                    placeId: placeRow.id,
                    type: item.type,
                    value: item.value,
                  })),
                )
                .returning({
                  id: supportContact.id,
                  type: supportContact.type,
                  value: supportContact.value,
                })
            : [];

        if (input.place.type === "offline") {
          const [addressRow] = await tx
            .insert(address)
            .values({
              city: input.place.address.city,
              country: input.place.address.country,
              placeId: placeRow.id,
              postalCode: input.place.address.postalCode,
              state: input.place.address.state,
              street: input.place.address.street,
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

          updated = {
            contactEmail: profileRow.contactEmail,
            displayName: profileRow.displayName,
            operatorId: profileRow.operatorId,
            place: {
              address: addressRow,
              id: placeRow.id,
              name: placeRow.name,
              supportContacts: returnedSupportContacts,
              type: "offline",
            },
          };
          return;
        }

        const [websiteRow] = await tx
          .insert(website)
          .values({
            placeId: placeRow.id,
            url: input.place.website.url,
          })
          .returning({ url: website.url });

        if (!websiteRow) {
          throw new Error("Failed to insert website");
        }

        updated = {
          contactEmail: profileRow.contactEmail,
          displayName: profileRow.displayName,
          operatorId: profileRow.operatorId,
          place: {
            id: placeRow.id,
            name: placeRow.name,
            supportContacts: returnedSupportContacts,
            type: "online",
            website: websiteRow,
          },
        };
      });

      return ok(updated);
    } catch (error) {
      return err(
        new GenericError(`Failed to update operator profile: ${String(error)}`),
      );
    }
  };

export const createDrizzleProfileRepository = (
  db: TypedDbClient<typeof schema>,
): ProfileRepository => ({
  create: async (
    input: Profile,
  ): Promise<Result<Profile, ConflictError | GenericError>> => {
    try {
      let created!: Profile;
      await db.transaction(async (tx) => {
        const returnedPlace = await createPlaceInTransaction(
          tx,
          input.operatorId,
          input.place,
        );

        const [createdProfile] = await tx
          .insert(profile)
          .values({
            contactEmail: input.contactEmail,
            displayName: input.displayName,
            operatorId: input.operatorId,
            placeId: input.place.id,
          })
          .onConflictDoNothing({ target: profile.operatorId })
          .returning({
            contactEmail: profile.contactEmail,
            displayName: profile.displayName,
            operatorId: profile.operatorId,
          });

        if (!createdProfile) {
          throw new ConflictError("Operator profile already exists");
        }

        created = {
          contactEmail: createdProfile.contactEmail,
          displayName: createdProfile.displayName,
          operatorId: createdProfile.operatorId,
          place: returnedPlace,
        };
      });

      return ok(created);
    } catch (error) {
      if (error instanceof ConflictError) {
        return err(error);
      }
      return err(
        new GenericError(`Failed to create operator profile: ${String(error)}`),
      );
    }
  },

  getByOperatorId: async (
    operatorId: string,
  ): Promise<Result<Profile | undefined, GenericError>> => {
    try {
      const profileRow = await db.query.profile.findFirst({
        columns: {
          contactEmail: true,
          displayName: true,
          operatorId: true,
          placeId: true,
        },
        where: eq(profile.operatorId, operatorId),
      });

      if (!profileRow) {
        return ok(undefined);
      }

      const placeRow = await db.query.place.findFirst({
        columns: { id: true, name: true, type: true },
        where: eq(place.id, profileRow.placeId),
        with: {
          address: {
            columns: {
              city: true,
              country: true,
              postalCode: true,
              state: true,
              street: true,
            },
          },
          supportContacts: {
            columns: { id: true, type: true, value: true },
            orderBy: [asc(supportContact.createdAt), asc(supportContact.id)],
          },
          website: { columns: { url: true } },
        },
      });

      if (!placeRow) {
        return err(
          new GenericError(
            `Data integrity error: profile for operator ${operatorId} references a missing place`,
          ),
        );
      }

      const mappedPlace = mapPlaceRow(placeRow);
      if (mappedPlace.isErr()) {
        return err(mappedPlace.error);
      }

      return ok({
        contactEmail: profileRow.contactEmail,
        displayName: profileRow.displayName,
        operatorId: profileRow.operatorId,
        place: mappedPlace.value,
      });
    } catch (error) {
      return err(
        new GenericError(`Failed to get operator profile: ${String(error)}`),
      );
    }
  },
  updateByOperatorId: updateByOperatorId(db),
});
