import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { and, asc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { err, ok } from "neverthrow";

import type { MessageOutboxRepository } from "../../../domain/ports/outbound/persistence/message-outbox.repository.js";

import {
  MESSAGE_OUTBOX_MAX_ATTEMPTS,
  MESSAGE_OUTBOX_STATUS,
} from "../../../domain/entities/message-outbox.js";
import * as schema from "./schema/index.js";
import { messageOutbox } from "./schema/tables.js";

const STALE_SENDING_ERROR =
  "Delivery outcome unknown: the run was interrupted while sending";

export const createDrizzleMessageOutboxRepository = (
  db: TypedDbClient<typeof schema>,
): MessageOutboxRepository => ({
  claimNext: async (claimedBefore) => {
    try {
      const claimed = await db.transaction(async (tx) => {
        const [row] = await tx
          .select()
          .from(messageOutbox)
          .where(
            and(
              eq(messageOutbox.status, MESSAGE_OUTBOX_STATUS.PENDING),
              lt(messageOutbox.attemptCount, MESSAGE_OUTBOX_MAX_ATTEMPTS),
              or(
                isNull(messageOutbox.claimedAt),
                lt(messageOutbox.claimedAt, claimedBefore),
              ),
            ),
          )
          .orderBy(asc(messageOutbox.createdAt))
          .limit(1)
          .for("update", { skipLocked: true });

        if (!row) return undefined;

        const now = new Date();
        await tx
          .update(messageOutbox)
          .set({
            attemptCount: sql`${messageOutbox.attemptCount} + 1`,
            claimedAt: now,
            status: MESSAGE_OUTBOX_STATUS.SENDING,
            updatedAt: now,
          })
          .where(eq(messageOutbox.id, row.id));

        return {
          attemptCount: row.attemptCount + 1,
          id: row.id,
          payload: row.payload,
        };
      });
      return ok(claimed);
    } catch (error) {
      return err(
        new GenericError(`Failed to claim outbox message: ${String(error)}`),
      );
    }
  },

  failStaleSending: async (olderThan) => {
    try {
      const rows = await db
        .update(messageOutbox)
        .set({
          lastError: STALE_SENDING_ERROR,
          status: MESSAGE_OUTBOX_STATUS.FAILED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messageOutbox.status, MESSAGE_OUTBOX_STATUS.SENDING),
            lt(messageOutbox.claimedAt, olderThan),
          ),
        )
        .returning({ id: messageOutbox.id });
      return ok(rows.length);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to fail stale outbox messages: ${String(error)}`,
        ),
      );
    }
  },

  markFailed: async ({ error, id }) => {
    try {
      await db
        .update(messageOutbox)
        .set({
          lastError: error,
          status: sql`CASE WHEN ${messageOutbox.attemptCount} >= ${MESSAGE_OUTBOX_MAX_ATTEMPTS} THEN 'failed'::message_outbox_status ELSE 'pending'::message_outbox_status END`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messageOutbox.id, id),
            eq(messageOutbox.status, MESSAGE_OUTBOX_STATUS.SENDING),
          ),
        );
      return ok(undefined);
    } catch (cause) {
      return err(
        new GenericError(
          `Failed to mark outbox message as failed: ${String(cause)}`,
        ),
      );
    }
  },

  markSent: async (id) => {
    try {
      const now = new Date();
      await db
        .update(messageOutbox)
        .set({
          sentAt: now,
          status: MESSAGE_OUTBOX_STATUS.SENT,
          updatedAt: now,
        })
        .where(
          and(
            eq(messageOutbox.id, id),
            eq(messageOutbox.status, MESSAGE_OUTBOX_STATUS.SENDING),
          ),
        );
      return ok(undefined);
    } catch (error) {
      return err(
        new GenericError(
          `Failed to mark outbox message as sent: ${String(error)}`,
        ),
      );
    }
  },
});
