import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, desc, eq, isNotNull, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OperatorProfileDetail } from "../../../domain/entities/profile.js";
import type { ProfileRepository } from "../../../domain/ports/outbound/persistence/profile.repository.js";

import * as schema from "./schema/index.js";
import {
  opportunityMaterializedView,
  placeMaterializedView,
  profile,
  supportContact,
} from "./schema/tables.js";

export const createDrizzleProfileRepository = (
  db: TypedDbClient<typeof schema>,
): ProfileRepository => ({
  getById: async ({
    language,
    profileId,
  }): Promise<Result<OperatorProfileDetail | undefined, GenericError>> => {
    try {
      const profileRow = await db.query.profile.findFirst({
        columns: {
          displayName: true,
          operatorId: true,
        },
        where: eq(profile.id, profileId),
        with: {
          place: {
            columns: {
              id: true,
              name: true,
              type: true,
            },
            with: {
              address: {
                columns: {
                  city: true,
                  postalCode: true,
                  state: true,
                  street: true,
                },
              },
              supportContacts: {
                columns: {
                  id: true,
                  type: true,
                  value: true,
                },
                orderBy: [
                  asc(supportContact.createdAt),
                  asc(supportContact.id),
                ],
              },
              website: {
                columns: {
                  url: true,
                },
              },
            },
          },
        },
      });

      if (!profileRow) {
        return ok(undefined);
      }

      if (!profileRow.place) {
        return err(
          new GenericError(
            `Data integrity error: profile ${profileId} references a missing place`,
          ),
        );
      }

      const [placeRows, opportunityRows] = await Promise.all([
        db
          .selectDistinct({
            city: placeMaterializedView.city,
            country: placeMaterializedView.country,
            id: placeMaterializedView.id,
            name: sql<string>`${placeMaterializedView.name}`,
            postalCode: placeMaterializedView.postalCode,
            state: placeMaterializedView.state,
            street: placeMaterializedView.street,
            type: sql<"offline" | "online">`${placeMaterializedView.type}`,
            url: placeMaterializedView.url,
          })
          .from(placeMaterializedView)
          .where(
            and(
              eq(placeMaterializedView.operatorId, profileRow.operatorId),
              isNotNull(placeMaterializedView.name),
              isNotNull(placeMaterializedView.type),
            ),
          )
          .orderBy(desc(placeMaterializedView.id))
          .limit(5),
        db
          .select({
            beneficiaryBenefitDiscountType:
              opportunityMaterializedView.beneficiaryBenefitDiscountType,
            beneficiaryBenefitType: sql<
              "discount" | "free" | "other" | "priority" | "reduced_fixed_price"
            >`${opportunityMaterializedView.beneficiaryBenefitType}`,
            beneficiaryBenefitValue:
              opportunityMaterializedView.beneficiaryBenefitValue,
            dateFrom: opportunityMaterializedView.dateFrom,
            dateTo: opportunityMaterializedView.dateTo,
            id: opportunityMaterializedView.id,
            name: sql<string>`${opportunityMaterializedView.name}`,
          })
          .from(opportunityMaterializedView)
          .where(
            and(
              eq(opportunityMaterializedView.operatorId, profileRow.operatorId),
              eq(opportunityMaterializedView.language, language),
              isNotNull(opportunityMaterializedView.name),
              isNotNull(opportunityMaterializedView.beneficiaryBenefitType),
              isNotNull(opportunityMaterializedView.dateFrom),
            ),
          )
          .orderBy(
            desc(opportunityMaterializedView.dateFrom),
            desc(opportunityMaterializedView.id),
          )
          .limit(5),
      ]);

      return ok({
        displayName: profileRow.displayName,
        place: {
          address: profileRow.place.address
            ? {
                city: profileRow.place.address.city,
                postalCode: profileRow.place.address.postalCode,
                state: profileRow.place.address.state,
                street: profileRow.place.address.street,
              }
            : null,
          id: profileRow.place.id,
          name: profileRow.place.name,
          supportContacts: profileRow.place.supportContacts.map((item) => ({
            id: item.id,
            type: item.type,
            value: item.value,
          })),
          type: profileRow.place.type,
          website: profileRow.place.website?.url ?? null,
        },
        recentOpportunities: opportunityRows.flatMap((row) =>
          row.dateFrom
            ? [
                {
                  beneficiaryBenefit: {
                    discountType: row.beneficiaryBenefitDiscountType,
                    type: row.beneficiaryBenefitType,
                    value: row.beneficiaryBenefitValue,
                  },
                  ...(row.dateTo ? { dateTo: row.dateTo } : { dateTo: null }),
                  dateFrom: row.dateFrom,
                  id: row.id,
                  name: row.name,
                },
              ]
            : [],
        ),
        recentPlaces: placeRows.map((row) => ({
          city: row.city ?? null,
          country: row.country ?? null,
          id: row.id,
          name: row.name,
          postalCode: row.postalCode ?? null,
          state: row.state ?? null,
          street: row.street ?? null,
          type: row.type,
          url: row.url ?? null,
        })),
      });
    } catch (error) {
      return err(
        new GenericError(
          `Failed to get operator profile detail: ${String(error)}`,
        ),
      );
    }
  },
});
