import type { Result } from "neverthrow";

import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { asc, eq } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Profile } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";
import type { DbClient } from "./client.js";

import { mapPlaceRow } from "./place-row.mapper.js";
import { createPlaceInTransaction } from "./place.transaction.js";
import { place, profile, supportContact } from "./schema/tables.js";

export const createDrizzleProfileRepository = (
  db: DbClient,
): ProfileRepository => ({
  create: async (
    input: Profile,
  ): Promise<Result<void, ConflictError | GenericError>> => {
    try {
      await db.transaction(async (tx) => {
        await createPlaceInTransaction(tx, input.operatorId, input.place);

        const createdProfiles = await tx
          .insert(profile)
          .values({
            displayName: input.displayName,
            operatorId: input.operatorId,
            placeId: input.place.id,
          })
          .onConflictDoNothing({ target: profile.operatorId })
          .returning({ id: profile.id });

        if (createdProfiles.length === 0) {
          throw new ConflictError("Operator profile already exists");
        }
      });

      return ok(undefined);
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
});
