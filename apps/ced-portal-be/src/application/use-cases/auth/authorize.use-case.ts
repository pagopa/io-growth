import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ResultAsync } from "neverthrow";

import type { UserType } from "../../../domain/entities/user-type.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

export interface AuthorizeInput {
  readonly id: string;
}

export interface AuthorizeOutput {
  readonly first_name: string;
  readonly institution_name: string;
  readonly last_name: string;
  readonly session_token: string;
  readonly user_type: UserType;
}

export const makeAuthorizeUseCase =
  (
    sessionRepository: SessionRepository,
  ): UseCase<AuthorizeInput, AuthorizeOutput, BaseError> =>
  async (input) =>
    new ResultAsync(
      sessionRepository.getSessionTokenByOneTimeId(input.id),
    ).andThen((token) =>
      new ResultAsync(sessionRepository.getSession(token)).map((session) => ({
        first_name: session.firstName,
        institution_name: session.operatorName,
        last_name: session.lastName,
        session_token: token,
        user_type: session.userType,
      })),
    );
