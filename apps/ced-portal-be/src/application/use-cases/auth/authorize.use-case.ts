import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";

import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

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
    sessionRepository: SessionRepository,
  ): UseCase<AuthorizeInput, AuthorizeOutput, BaseError> =>
  async (input) =>
    new ResultAsync(
      sessionRepository.getSessionTokenByOneTimeId(input.query.id),
    ).andThen((token) =>
      new ResultAsync(sessionRepository.getSession(token)).map((session) => ({
        first_name: session.firstName,
        last_name: session.lastName,
        operator_name: session.operatorName,
        session_token: token,
      })),
    );
