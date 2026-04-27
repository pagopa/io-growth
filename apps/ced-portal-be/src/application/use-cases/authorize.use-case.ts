import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";

import type { SessionStore } from "../ports/session-store.port.js";

export interface AuthorizeInput {
  readonly query: {
    readonly id: string;
  };
}

export interface AuthorizeOutput {
  readonly first_name: string;
  readonly last_name: string;
  readonly operator_name: string;
  readonly session_token: string;
}

export const makeAuthorizeUseCase =
  (
    sessionStore: SessionStore,
  ): UseCase<AuthorizeInput, AuthorizeOutput, BaseError> =>
  async (input) =>
    new ResultAsync(
      sessionStore.getSessionTokenByOneTimeId(input.query.id),
    ).andThen((token) =>
      new ResultAsync(sessionStore.getSession(token)).map((session) => ({
        first_name: session.firstName,
        last_name: session.lastName,
        operator_name: session.operatorName,
        session_token: token,
      })),
    );
