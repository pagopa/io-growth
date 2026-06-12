import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, eq, ne, or, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type {
  AccessPointDetail,
  AccessPointDetailInput,
  AccessPointSearchItem,
  PlaceRepository,
} from "../../../domain/ports/outbound/persistence/place.repository.js";

import { mapAccessPointDetailRow } from "./access-point-detail-row.mapper.js";
import * as schema from "./schema/index.js";
import {
  opportunityMaterializedView,
  place,
  placeMaterializedView,
} from "./schema/tables.js";

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

  findById: async ({
    language,
    placeId,
  }: AccessPointDetailInput): Promise<
    Result<AccessPointDetail | undefined, GenericError>
  > => {
    try {
      const placeRow = await db.query.place.findFirst({
        columns: { id: true, name: true, operatorId: true, type: true },
        where: eq(place.id, placeId),
        with: {
          address: {
            columns: {
              city: true,
              postalCode: true,
              state: true,
              street: true,
            },
          },
          operator: {
            columns: {},
            with: { profile: { columns: { displayName: true } } },
          },
          supportContacts: { columns: { type: true, value: true } },
          website: { columns: { url: true } },
        },
      });

      if (!placeRow) return ok(undefined);

      const [opportunityRows, relatedRows] = await Promise.all([
        db
          .select({
            benefitDiscountType:
              opportunityMaterializedView.beneficiaryBenefitDiscountType,
            benefitType: opportunityMaterializedView.beneficiaryBenefitType,
            benefitValue: opportunityMaterializedView.beneficiaryBenefitValue,
            opportunityId: opportunityMaterializedView.id,
            title: opportunityMaterializedView.name,
          })
          .from(opportunityMaterializedView)
          .where(
            and(
              eq(opportunityMaterializedView.placeId, placeId),
              eq(opportunityMaterializedView.language, language),
            ),
          ),
        db.query.place.findMany({
          orderBy: [asc(place.name)],
          where: and(
            eq(place.operatorId, placeRow.operatorId),
            ne(place.id, placeId),
          ),
          with: {
            address: {
              columns: {
                city: true,
                postalCode: true,
                state: true,
                street: true,
              },
            },
          },
        }),
      ]);

      return ok(
        mapAccessPointDetailRow(placeRow, opportunityRows, relatedRows),
      );
    } catch (error) {
      return err(
        new GenericError(`Failed to get access point detail: ${String(error)}`),
      );
    }
  },
});
