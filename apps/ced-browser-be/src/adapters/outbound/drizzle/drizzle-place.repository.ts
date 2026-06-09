import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { or, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  AccessPointSearchItem,
  PlaceRepository,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import * as schema from "./schema/index.js";
import { placeMaterializedView } from "./schema/tables.js";

export const createDrizzlePlaceRepository = (
  db: TypedDbClient<typeof schema>,
): PlaceRepository => ({
  findAllByFullText: async ({
    limit,
    query,
  }): Promise<Result<AccessPointSearchItem[], GenericError>> => {
    try {
      const tsQuery = sql`plainto_tsquery('italian', ${query})`;
      const rows = await db
        .selectDistinct({
          city: placeMaterializedView.city,
          entityId: placeMaterializedView.operatorId,
          id: placeMaterializedView.id,
          name: sql<string>`COALESCE(${placeMaterializedView.profileDisplayName}, ${placeMaterializedView.name})`,
          postalCode: placeMaterializedView.postalCode,
          state: placeMaterializedView.state,
          street: placeMaterializedView.street,
          type: sql<
            "place" | "profile"
          >`CASE WHEN ${placeMaterializedView.profileId} IS NOT NULL THEN 'profile' ELSE 'place' END`,
          url: placeMaterializedView.url,
        })
        .from(placeMaterializedView)
        .where(
          or(
            sql`${placeMaterializedView.searchVectorName} @@ ${tsQuery}`,
            sql`${placeMaterializedView.searchVectorCity} @@ ${tsQuery}`,
            sql`${placeMaterializedView.searchVectorDisplayName} @@ ${tsQuery}`,
          ),
        )
        .limit(limit ?? 100);

      return ok(
        rows.map((row) => ({
          address:
            row.street && row.city && row.postalCode && row.state
              ? {
                  city: row.city,
                  postalCode: row.postalCode,
                  state: row.state,
                  street: row.street,
                }
              : null,
          entityId: row.entityId ?? "",
          id: row.id,
          name: row.name,
          type: row.type,
          ...(row.url ? { url: row.url } : {}),
        })),
      );
    } catch (error) {
      return err(
        new GenericError(`Failed to search access points: ${String(error)}`),
      );
    }
  },
});
