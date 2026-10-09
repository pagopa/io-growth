import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { err, ok, type Result } from "neverthrow";

import type { OutboxMessage } from "../../../domain/entities/message-outbox.js";
import type { EmailRepository } from "../../../domain/ports/outbound/email.repository.js";
import type { MessageOutboxRepository } from "../../../domain/ports/outbound/persistence/message-outbox.repository.js";
import type { TracingRepository } from "../../../domain/ports/outbound/tracing.repository.js";

import { JobEnvironment } from "../../../domain/entities/job.js";
import { MessagePayloadSchema } from "../../../domain/entities/message-outbox.js";

export interface JobSendOutboxMessagesOptions {
  readonly now?: () => number;
  readonly sleep?: (ms: number) => Promise<void>;
}

export type JobSendOutboxMessagesUseCase = UseCase<
  Record<string, never>,
  void,
  GenericError
>;

const JOB_SEND_OUTBOX_MESSAGES_USE_CASE = "JobSendOutboxMessagesUseCase";

const SEND_INTERVAL_MS = 1_000;
// Shorter than the 5 minute schedule so consecutive runs never overlap.
const RUN_DEADLINE_MS = 270_000;
// A claim older than this is assumed to belong to a crashed run.
const STALE_SENDING_MS = 15 * 60 * 1_000;

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const makeJobSendOutboxMessagesUseCase = (
  environment: JobEnvironment,
  messageOutboxRepository: MessageOutboxRepository,
  emailRepository: EmailRepository,
  tracingRepository: TracingRepository,
  { now = Date.now, sleep = defaultSleep }: JobSendOutboxMessagesOptions = {},
): JobSendOutboxMessagesUseCase => {
  const send = async (
    message: OutboxMessage,
  ): Promise<Result<void, string>> => {
    const payload = MessagePayloadSchema.safeParse(message.payload);
    if (!payload.success) {
      return err(`Invalid outbox payload: ${payload.error.message}`);
    }
    const result =
      payload.data.type === "template"
        ? await emailRepository.sendTemplateEmail(payload.data)
        : await emailRepository.sendHtmlEmail(payload.data);
    return result.mapErr((error) => error.message);
  };

  const sendAndRecord = async (
    message: OutboxMessage,
  ): Promise<Result<void, GenericError>> => {
    const sent = await send(message);
    return sent.isOk()
      ? messageOutboxRepository.markSent(message.id)
      : messageOutboxRepository.markFailed({
          error: sent.error,
          id: message.id,
        });
  };

  const run = async (): Promise<Result<void, GenericError>> => {
    const startedAt = now();

    const swept = await messageOutboxRepository.failStaleSending(
      new Date(startedAt - STALE_SENDING_MS),
    );
    if (swept.isErr()) return err(swept.error);

    while (now() - startedAt < RUN_DEADLINE_MS) {
      const claimed = await messageOutboxRepository.claimNext(
        new Date(startedAt),
      );
      if (claimed.isErr()) return err(claimed.error);
      if (!claimed.value) return ok(undefined);

      const recorded = await sendAndRecord(claimed.value);
      if (recorded.isErr()) return err(recorded.error);

      await sleep(SEND_INTERVAL_MS);
    }
    return ok(undefined);
  };

  return async () =>
    tracingRepository.traceExecution(
      run,
      JOB_SEND_OUTBOX_MESSAGES_USE_CASE,
      environment,
    );
};
