import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { inArray, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { OpportunityNotificationRepository } from "../../../domain/ports/outbound/persistence/opportunity-notification.repository.js";

import { buildOpportunityPublishedMessage } from "../../../domain/entities/message-outbox.js";
import { enqueueMessagesInTransaction } from "./message-outbox.transaction.js";
import * as schema from "./schema/index.js";
import { opportunity } from "./schema/tables.js";

interface VisibleOpportunityRow extends Record<string, unknown> {
  email: string;
  id: string;
  name: string;
}

export const createDrizzleOpportunityNotificationRepository = (
  db: TypedDbClient<typeof schema>,
): OpportunityNotificationRepository => ({
  enqueuePublishedMessages: async (limit) => {
    try {
      const notified = await db.transaction(async (tx) => {
        // The view can lag behind the table, so the live visibility predicate
        // is checked too: the reset trigger would otherwise undo the flag below.
        const rows = await tx.execute<VisibleOpportunityRow>(sql`
          SELECT
            o.id::text AS id,
            p.contact_email AS email,
            COALESCE(
              (SELECT lm.value FROM localized_metadata lm
                WHERE lm.opportunity_id = o.id AND lm.key = 'name' AND lm.language = 'it'),
              o.id::text
            ) AS name
          FROM opportunity o
          JOIN profile p ON p.operator_id = o.operator_id
          WHERE o.publishing_notified_at IS NULL
            AND o.status = 'published'
            AND CURRENT_DATE >= o.date_from
            AND CURRENT_DATE <= COALESCE(o.date_to, 'infinity'::date)
            AND EXISTS (SELECT 1 FROM opportunity_materialized_view mv WHERE mv.id = o.id)
          ORDER BY o.created_at
          LIMIT ${limit}
          FOR UPDATE OF o SKIP LOCKED
        `);

        if (rows.length === 0) return 0;

        await enqueueMessagesInTransaction(
          tx,
          rows.map((row) =>
            buildOpportunityPublishedMessage({
              opportunityName: row.name,
              to: row.email,
            }),
          ),
        );
        await tx
          .update(opportunity)
          .set({ publishingNotifiedAt: new Date() })
          .where(
            inArray(
              opportunity.id,
              rows.map((row) => row.id),
            ),
          );

        return rows.length;
      });
      return ok(notified);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to enqueue published messages: ${String(error)}`,
        ),
      );
    }
  },
});
