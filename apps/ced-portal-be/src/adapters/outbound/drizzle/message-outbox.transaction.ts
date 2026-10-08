import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";

import type { MessagePayload } from "../../../domain/entities/message-outbox.js";

import * as schema from "./schema/index.js";
import { messageOutbox } from "./schema/tables.js";

type TransactionClient = Parameters<
  Parameters<TypedDbClient<typeof schema>["transaction"]>[0]
>[0];

/** Inserts the messages as pending rows inside an existing transaction. */
export const enqueueMessagesInTransaction = async (
  tx: TransactionClient,
  messages: readonly MessagePayload[] | undefined,
): Promise<void> => {
  if (!messages?.length) return;
  await tx
    .insert(messageOutbox)
    .values(messages.map((payload) => ({ payload, type: payload.type })));
};
