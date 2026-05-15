import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { Place } from "../../../domain/entities/place.js";
import type { PlaceRepository } from "../../../domain/ports/outbound/persistence/place.repository.js";

import { mapPlaceRow, mapPlaceRows } from "./place-row.mapper.js";
import {
  createPlaceInTransaction,
  doPlaceDelete,
  doPlaceUpdate,
} from "./place.transaction.js";
import * as schema from "./schema/index.js";
import {
  opportunityPlace,
  place,
  profile,
  supportContact,
} from "./schema/tables.js";

export const createDrizzlePlaceRepository = (
  db: TypedDbClient<typeof schema>,
): PlaceRepository => ({
  create: async (input): Promise<Result<Place, GenericError>> => {
    try {
      let created!: Place;
      await db.transaction(async (tx) => {
        created = await createPlaceInTransaction(
          tx,
          input.operatorId,
          input.place,
        );
      });

      return ok(created);
    } catch (error) {
      return err(
        new GenericError(`Failed to create operator place: ${String(error)}`),
      );
    }
  },

  delete: async (input): Promise<Result<void, GenericError>> => {
    try {
      await db.transaction((tx) => doPlaceDelete(tx, input));
      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(`Failed to delete operator place: ${String(error)}`),
      );
    }
  },

  existsById: async (input): Promise<Result<boolean, GenericError>> => {
    try {
      const rows = await db
        .select({ count: count() })
        .from(place)
        .where(
          and(
            eq(place.id, input.placeId),
            eq(place.operatorId, input.operatorId),
          ),
        );
      return ok((rows[0]?.count ?? 0) > 0);
    } catch (error) {
      return err(
        new GenericError(`Failed to check place existence: ${String(error)}`),
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

  hasOpportunityLinks: async (
    placeId: string,
  ): Promise<Result<boolean, GenericError>> => {
    try {
      const rows = await db
        .select({ count: count() })
        .from(opportunityPlace)
        .where(eq(opportunityPlace.placeId, placeId));
      return ok((rows[0]?.count ?? 0) > 0);
    } catch (error) {
      return err(
        new GenericError(`Failed to check opportunity links: ${String(error)}`),
      );
    }
  },

  hasProfile: async (input): Promise<Result<boolean, GenericError>> => {
    try {
      const rows = await db
        .select({ count: count() })
        .from(profile)
        .where(
          and(
            eq(profile.placeId, input.placeId),
            eq(profile.operatorId, input.operatorId),
          ),
        );
      return ok((rows[0]?.count ?? 0) > 0);
    } catch (error) {
      return err(
        new GenericError(`Failed to check place profile: ${String(error)}`),
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

  update: async (input): Promise<Result<void, GenericError>> => {
    try {
      await db.transaction((tx) => doPlaceUpdate(tx, input));
      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(`Failed to update operator place: ${String(error)}`),
      );
    }
  },
});
