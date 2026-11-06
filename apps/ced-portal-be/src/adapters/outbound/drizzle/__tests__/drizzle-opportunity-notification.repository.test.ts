import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";

import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { GenericError } from "@pagopa/io-core-domain/errors";
import { PgDialect, PgTransaction } from "drizzle-orm/pg-core";
import { err, ok } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { TemplateMessagePayload } from "../../../../domain/entities/message-outbox.js";

import { createDrizzleOpportunityNotificationRepository } from "../drizzle-opportunity-notification.repository.js";
import { createDrizzleOpportunityRepository } from "../drizzle-opportunity.repository.js";
import * as schema from "../schema/index.js";

type Transaction = Parameters<
  Parameters<TypedDbClient<typeof schema>["transaction"]>[0]
>[0];
class TestTransaction extends PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
> {
  override transaction<T>(run: (tx: Transaction) => Promise<T>): Promise<T> {
    return run(this);
  }
}

const links = {
  runbookUrl: "https://example.org/runbook",
  selfcareUrl: "https://example.org/selfcare",
  supportUrl: "https://example.org/support",
};
const message: TemplateMessagePayload = {
  templateAttributes: { ...links, opportunityName: "Sconto" },
  templateId: "ced_operator-opportunity-republished_v1",
  to: "operator@example.org",
  type: "template",
};
const clients: TypedDbClient<typeof schema>[] = [];
const resultRows = <T extends Record<string, unknown>>(
  rows: T[],
  count = rows.length,
) =>
  Object.assign(rows, {
    columns: [],
    command: "UPDATE",
    count,
    state: { pid: 0, secret: 0, status: "I" },
    statement: { columns: [], name: "", string: "", types: [] },
  });

const makeDatabase = (count = 1, enqueueFails = false) => {
  const db = createTypedDbClient(
    { database: "unused", host: "localhost", port: 5432, user: "unused" },
    schema,
  );
  clients.push(db);
  const tx = new TestTransaction(new PgDialect(), db._.session, undefined);
  const order: string[] = [];
  const update = tx.update(schema.opportunity);
  const updateQuery = update.set({ updatedAt: new Date() });
  vi.spyOn(tx, "update").mockReturnValue(update);
  const updateValues = vi.spyOn(update, "set").mockReturnValue(updateQuery);
  vi.spyOn(updateQuery, "execute").mockImplementation(async () => {
    order.push("update");
    return resultRows([], count);
  });
  const insert = tx.insert(schema.messageOutbox);
  const insertQuery = insert.values([{ payload: message, type: "template" }]);
  vi.spyOn(tx, "insert").mockReturnValue(insert);
  const values = vi.spyOn(insert, "values").mockReturnValue(insertQuery);
  vi.spyOn(insertQuery, "execute").mockImplementation(async () => {
    order.push("enqueue");
    if (enqueueFails) throw new Error("outbox unavailable");
    return resultRows([]);
  });
  const rollback = vi.fn();
  const transaction = vi
    .spyOn(db, "transaction")
    .mockImplementation(async (run) => {
      try {
        return await run(tx);
      } catch (error) {
        rollback();
        throw error;
      }
    });
  return {
    db,
    order,
    rollback,
    transaction,
    tx,
    updateQuery,
    updateValues,
    values,
  };
};

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    clients.splice(0).map((client) => client.closeConnection()),
  );
});

const input = { opportunityId: "opportunity", outboxMessages: [message] };

describe("approval change-request metadata", () => {
  it("clears the stored change-request message when explicitly requested", async () => {
    const h = makeDatabase();
    await expect(
      createDrizzleOpportunityRepository(h.db).updateStatusById({
        ...input,
        changeRequestMessage: null,
        expectedStatuses: ["test_pending", "test_rejected"],
        status: "published",
      }),
    ).resolves.toEqual(ok(undefined));
    expect(h.updateValues).toHaveBeenCalledWith(
      expect.objectContaining({
        changeRequestMessage: null,
        status: "published",
      }),
    );
    expect(h.order).toEqual(["update", "enqueue"]);
  });

  it("does not clear the change-request message when the field is omitted", async () => {
    const h = makeDatabase();
    await expect(
      createDrizzleOpportunityRepository(h.db).updateStatusById({
        ...input,
        expectedStatuses: ["test_pending"],
        status: "published",
      }),
    ).resolves.toEqual(ok(undefined));
    expect(h.updateValues.mock.calls[0][0]).not.toHaveProperty(
      "changeRequestMessage",
    );
  });
});

const transitions = [
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.deleteByIdAndOperatorId({
      ...input,
      expectedStatuses: ["suspended"],
      operatorId: "operator",
    }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.suspendById({ ...input, suspensionMessage: "reason" }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.suspendByIdAndOperatorId({
      ...input,
      operatorId: "operator",
      suspensionMessage: "reason",
    }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.cancelScheduledSuspensionById({
      ...input,
      expectedSuspendFrom: "2026-08-01",
    }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.cancelScheduledSuspensionByIdAndOperatorId({
      ...input,
      operatorId: "operator",
    }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.rejectRepublishById({
      ...input,
      republishRejectionMessage: "reason",
    }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.republishById(input),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.republishByIdAndOperatorId({ ...input, operatorId: "operator" }),
  (repository: ReturnType<typeof createDrizzleOpportunityRepository>) =>
    repository.requestRepublishByIdAndOperatorId({
      ...input,
      operatorId: "operator",
      republishMessage: "reason",
    }),
];

describe.each(transitions)("notification state transition %#", (transition) => {
  it("updates and enqueues within the same transaction, in that order", async () => {
    const h = makeDatabase();
    await expect(
      transition(createDrizzleOpportunityRepository(h.db)),
    ).resolves.toEqual(ok(undefined));
    expect(h.transaction).toHaveBeenCalledOnce();
    expect(h.order).toEqual(["update", "enqueue"]);
    expect(h.values).toHaveBeenCalledWith([
      { payload: message, type: "template" },
    ]);
  });

  it("does not enqueue after a conflicting update", async () => {
    const h = makeDatabase(0);
    await expect(
      transition(createDrizzleOpportunityRepository(h.db)),
    ).resolves.toEqual(err(expect.objectContaining({ kind: "ConflictError" })));
    expect(h.values).not.toHaveBeenCalled();
  });

  it("propagates enqueue failure out of the transaction for rollback", async () => {
    const h = makeDatabase(1, true);
    await expect(
      transition(createDrizzleOpportunityRepository(h.db)),
    ).resolves.toEqual(err(expect.any(GenericError)));
    expect(h.rollback).toHaveBeenCalledOnce();
    expect(h.order).toEqual(["update", "enqueue"]);
  });
});

it("guards cancellation against a schedule changing after the date was read", async () => {
  const h = makeDatabase();
  await createDrizzleOpportunityRepository(h.db).cancelScheduledSuspensionById({
    ...input,
    expectedSuspendFrom: "2026-08-01",
  });
  const query = h.updateQuery.toSQL();
  expect(query.sql).toContain('"suspend_from" =');
  expect(query.params).toContain("2026-08-01");
});

describe("published opportunity notifications", () => {
  it("uses the stored availability date and atomically marks notified", async () => {
    const h = makeDatabase();
    const query = h.tx.execute("SELECT 1");
    const execute = vi.spyOn(query, "execute").mockResolvedValue(
      resultRows([
        {
          availabilityDate: "31/12/2025",
          email: "operator@example.org",
          id: "opportunity",
          name: "Sconto",
        },
      ]),
    );
    const select = vi.spyOn(h.tx, "execute").mockReturnValue(query);
    await expect(
      createDrizzleOpportunityNotificationRepository(
        h.db,
        links,
      ).enqueuePublishedMessages(500),
    ).resolves.toEqual(ok(1));
    expect(execute).toHaveBeenCalledOnce();
    const selection = select.mock.calls[0][0];
    if (typeof selection === "string") {
      throw new Error("Expected a parameterized publication query");
    }
    const sql = new PgDialect().sqlToQuery(selection.getSQL()).sql;
    expect(sql).toContain("to_char(o.date_from, 'DD/MM/YYYY')");
    expect(sql).toContain("FOR UPDATE OF o SKIP LOCKED");
    expect(h.values).toHaveBeenCalledWith([
      {
        payload: {
          templateAttributes: {
            ...links,
            availabilityDate: "31/12/2025",
            opportunityName: "Sconto",
          },
          templateId: "ced_operator-opportunity-published_v1",
          to: "operator@example.org",
          type: "template",
        },
        type: "template",
      },
    ]);
    expect(h.order).toEqual(["enqueue", "update"]);
  });

  it("does nothing when no published opportunities are eligible", async () => {
    const h = makeDatabase();
    const query = h.tx.execute("SELECT 1");
    vi.spyOn(query, "execute").mockResolvedValue(resultRows([]));
    vi.spyOn(h.tx, "execute").mockReturnValue(query);
    await expect(
      createDrizzleOpportunityNotificationRepository(
        h.db,
        links,
      ).enqueuePublishedMessages(500),
    ).resolves.toEqual(ok(0));
    expect(h.order).toEqual([]);
    expect(h.values).not.toHaveBeenCalled();
  });

  it("does not mark notified when enqueue fails", async () => {
    const h = makeDatabase(1, true);
    const query = h.tx.execute("SELECT 1");
    vi.spyOn(query, "execute").mockResolvedValue(
      resultRows([
        {
          availabilityDate: "01/01/2026",
          email: message.to,
          id: "opportunity",
          name: "Sconto",
        },
      ]),
    );
    vi.spyOn(h.tx, "execute").mockReturnValue(query);
    await expect(
      createDrizzleOpportunityNotificationRepository(
        h.db,
        links,
      ).enqueuePublishedMessages(500),
    ).resolves.toEqual(err(expect.any(GenericError)));
    expect(h.order).toEqual(["enqueue"]);
    expect(h.rollback).toHaveBeenCalledOnce();
  });
});
