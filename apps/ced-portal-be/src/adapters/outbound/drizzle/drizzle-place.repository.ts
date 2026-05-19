import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, eq, inArray } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";
import type { DbClient } from "./client.js";

import { mapPlaceRow, mapPlaceRows } from "./place-row.mapper.js";
import { createPlaceInTransaction } from "./place.transaction.js";
import { place, supportContact } from "./schema/tables.js";

export const createDrizzlePlaceRepository = (
  db: DbClient,
): PlaceRepository => ({
  create: async (input): Promise<Result<void, GenericError>> => {
    try {
      await db.transaction(async (tx) => {
        await createPlaceInTransaction(tx, input.operatorId, input.place);
      });

      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(`Failed to create operator place: ${String(error)}`),
      );
    }
  },

  getById: async (input): Promise<Result<Place | undefined, GenericError>> => {
    try {
      const row = await db.query.place.findFirst({
        columns: { id: true, name: true, type: true },
        where: and(
          eq(place.id, input.placeId),
          eq(place.operatorId, input.operatorId),
        ),
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
          profile: { columns: { id: true } },
          supportContacts: {
            columns: { id: true, type: true, value: true },
            orderBy: [asc(supportContact.createdAt), asc(supportContact.id)],
          },
          website: { columns: { url: true } },
        },
      });

      if (!row || row.profile) {
        return ok(undefined);
      }

      return mapPlaceRow(row);
    } catch (error) {
      return err(
        new GenericError(`Failed to get operator place: ${String(error)}`),
      );
    }
  },

  getIdsByOperator: async (input): Promise<Result<string[], GenericError>> => {
    try {
      const rows = await db
        .select({ id: place.id })
        .from(place)
        .where(
          and(
            inArray(place.id, [...input.placeIds]),
            eq(place.operatorId, input.operatorId),
          ),
        );

      return ok(rows.map((row) => row.id));
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get place ids by operator: ${String(error)}`,
        ),
      );
    }
  },

  listByOperatorId: async (
    operatorId: string,
  ): Promise<Result<Place[], GenericError>> => {
    try {
      const rows = await db.query.place.findMany({
        columns: { id: true, name: true, type: true },
        orderBy: [asc(place.createdAt), asc(place.id)],
        where: eq(place.operatorId, operatorId),
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
          profile: { columns: { id: true } },
          supportContacts: {
            columns: { id: true, type: true, value: true },
            orderBy: [asc(supportContact.createdAt), asc(supportContact.id)],
          },
          website: { columns: { url: true } },
        },
      });

      const filteredRows = rows.filter((r) => !r.profile);

      return mapPlaceRows(filteredRows);
    } catch (error) {
      return err(
        new GenericError(`Failed to list operator places: ${String(error)}`),
      );
    }
  },
});
