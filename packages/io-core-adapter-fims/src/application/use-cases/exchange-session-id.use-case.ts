import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { FimsSessionStore } from "../../domain/ports/outbound/session.repository.js";

export type ExchangeSessionId = UseCase<
  { sessionId: string },
  { token: string },
  BaseError
>;

export const createExchangeSessionId =
  (sessionStore: FimsSessionStore): ExchangeSessionId =>
  async ({ sessionId }) => {
    const tokenResult = await sessionStore.getTemporary(`otp:${sessionId}`);
    if (tokenResult.isErr()) return err(tokenResult.error);
    if (!tokenResult.value) {
      return err(new UnauthorizedError("Session ID not found or expired"));
    }
    const token = tokenResult.value;
    // One-shot: always delete after retrieval
    await sessionStore.deleteTemporary(`otp:${sessionId}`);
    return ok({ token });
  };
