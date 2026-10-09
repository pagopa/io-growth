import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OutboxMessage } from "../../../../domain/entities/message-outbox.js";
import type { EmailRepository } from "../../../../domain/ports/outbound/email.repository.js";
import type { MessageOutboxRepository } from "../../../../domain/ports/outbound/persistence/message-outbox.repository.js";

import { createMockTracingRepository } from "../../__tests__/mocks.js";
import { makeJobSendOutboxMessagesUseCase } from "../job-send-outbox-messages.use-case.js";

const templateMessage = (id: string): OutboxMessage => ({
  attemptCount: 1,
  id,
  payload: {
    templateAttributes: { opportunityName: "Sconto" },
    templateId: "ced_opportunity-published",
    to: "operatore@example.org",
    type: "template",
  },
});

const htmlMessage = (id: string): OutboxMessage => ({
  attemptCount: 1,
  id,
  payload: {
    html: "<p>Ciao</p>",
    subject: "Oggetto",
    to: "operatore@example.org",
    type: "html",
  },
});

const makeDeps = (claims: (OutboxMessage | undefined)[]) => {
  const claimNext = vi.fn();
  for (const claim of claims) claimNext.mockResolvedValueOnce(ok(claim));
  claimNext.mockResolvedValue(ok(undefined));

  const messageOutboxRepository: MessageOutboxRepository = {
    claimNext,
    failStaleSending: vi.fn().mockResolvedValue(ok(0)),
    markFailed: vi.fn().mockResolvedValue(ok(undefined)),
    markSent: vi.fn().mockResolvedValue(ok(undefined)),
  };
  const emailRepository: EmailRepository = {
    sendHtmlEmail: vi.fn().mockResolvedValue(ok(undefined)),
    sendTemplateEmail: vi.fn().mockResolvedValue(ok(undefined)),
  };
  const sleep = vi.fn().mockResolvedValue(undefined);
  const tracingRepository = createMockTracingRepository();

  return { emailRepository, messageOutboxRepository, sleep, tracingRepository };
};

const makeUseCase = (
  deps: ReturnType<typeof makeDeps>,
  now: () => number = Date.now,
) =>
  makeJobSendOutboxMessagesUseCase(
    "prod",
    deps.messageOutboxRepository,
    deps.emailRepository,
    deps.tracingRepository,
    { now, sleep: deps.sleep },
  );

describe("makeJobSendOutboxMessagesUseCase", () => {
  it("should do nothing when there are no pending messages", async () => {
    const deps = makeDeps([]);

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(
      deps.messageOutboxRepository.failStaleSending,
    ).toHaveBeenCalledOnce();
    expect(deps.emailRepository.sendTemplateEmail).not.toHaveBeenCalled();
    expect(deps.emailRepository.sendHtmlEmail).not.toHaveBeenCalled();
    expect(deps.sleep).not.toHaveBeenCalled();
  });

  it("should run inside a traced execution", async () => {
    const deps = makeDeps([]);

    await makeUseCase(deps)({});

    expect(deps.tracingRepository.traceExecution).toHaveBeenCalledWith(
      expect.any(Function),
      "JobSendOutboxMessagesUseCase",
      "prod",
    );
  });

  it("should send template and html messages and mark them as sent", async () => {
    const deps = makeDeps([templateMessage("1"), htmlMessage("2")]);

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(deps.emailRepository.sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({ templateId: "ced_opportunity-published" }),
    );
    expect(deps.emailRepository.sendHtmlEmail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Oggetto" }),
    );
    expect(deps.messageOutboxRepository.markSent).toHaveBeenCalledWith("1");
    expect(deps.messageOutboxRepository.markSent).toHaveBeenCalledWith("2");
  });

  it("should wait one second after each send", async () => {
    const deps = makeDeps([templateMessage("1"), templateMessage("2")]);

    await makeUseCase(deps)({});

    expect(deps.sleep).toHaveBeenCalledTimes(2);
    expect(deps.sleep).toHaveBeenCalledWith(1_000);
  });

  it("should only claim messages not touched since the run started", async () => {
    const deps = makeDeps([templateMessage("1")]);

    await makeUseCase(deps, () => 1_000_000)({});

    expect(deps.messageOutboxRepository.claimNext).toHaveBeenCalledWith(
      new Date(1_000_000),
    );
  });

  it("should record the send error and keep going with the next message", async () => {
    const deps = makeDeps([templateMessage("1"), templateMessage("2")]);
    vi.mocked(deps.emailRepository.sendTemplateEmail).mockResolvedValueOnce(
      err(new GenericError("smtp down")),
    );

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(deps.messageOutboxRepository.markFailed).toHaveBeenCalledWith({
      error: expect.stringContaining("smtp down"),
      id: "1",
    });
    expect(deps.messageOutboxRepository.markSent).toHaveBeenCalledWith("2");
  });

  it("should mark a message with an invalid payload as failed without sending", async () => {
    const deps = makeDeps([{ attemptCount: 1, id: "1", payload: { foo: 1 } }]);

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(ok(undefined));
    expect(deps.emailRepository.sendTemplateEmail).not.toHaveBeenCalled();
    expect(deps.emailRepository.sendHtmlEmail).not.toHaveBeenCalled();
    expect(deps.messageOutboxRepository.markFailed).toHaveBeenCalledWith({
      error: expect.stringContaining("Invalid outbox payload"),
      id: "1",
    });
  });

  it("should stop claiming once the run deadline is reached", async () => {
    const deps = makeDeps([templateMessage("1"), templateMessage("2")]);
    let time = 0;
    deps.sleep.mockImplementation(async () => {
      time += 300_000;
    });

    const result = await makeUseCase(deps, () => time)({});

    expect(result).toEqual(ok(undefined));
    expect(deps.messageOutboxRepository.claimNext).toHaveBeenCalledOnce();
    expect(deps.messageOutboxRepository.markSent).toHaveBeenCalledOnce();
  });

  it("should sweep stale sending messages before claiming", async () => {
    const deps = makeDeps([]);

    await makeUseCase(deps, () => 100 * 60 * 1_000)({});

    expect(deps.messageOutboxRepository.failStaleSending).toHaveBeenCalledWith(
      new Date(85 * 60 * 1_000),
    );
  });

  it("should return the error when the stale sweep fails", async () => {
    const deps = makeDeps([templateMessage("1")]);
    const error = new GenericError("db down");
    vi.mocked(deps.messageOutboxRepository.failStaleSending).mockResolvedValue(
      err(error),
    );

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(err(error));
    expect(deps.messageOutboxRepository.claimNext).not.toHaveBeenCalled();
  });

  it("should return the error when claiming fails", async () => {
    const deps = makeDeps([]);
    const error = new GenericError("db down");
    vi.mocked(deps.messageOutboxRepository.claimNext).mockReset();
    vi.mocked(deps.messageOutboxRepository.claimNext).mockResolvedValue(
      err(error),
    );

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(err(error));
  });

  it("should stop the run when the outcome cannot be recorded", async () => {
    const deps = makeDeps([templateMessage("1"), templateMessage("2")]);
    const error = new GenericError("db down");
    vi.mocked(deps.messageOutboxRepository.markSent).mockResolvedValue(
      err(error),
    );

    const result = await makeUseCase(deps)({});

    expect(result).toEqual(err(error));
    expect(deps.emailRepository.sendTemplateEmail).toHaveBeenCalledOnce();
  });
});
