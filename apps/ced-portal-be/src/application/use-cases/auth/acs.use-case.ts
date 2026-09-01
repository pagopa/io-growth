import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { ValidationError } from "@pagopa/io-core-domain/errors";
import { hashUppercasedString } from "@pagopa/io-core-domain/utilities";
import { decodeJwt } from "jose";
import { err, okAsync, ResultAsync } from "neverthrow";
import { randomBytes } from "node:crypto";
import { ulid } from "ulid";
import { z } from "zod";

import type { AppConfig } from "../../../config.js";
import type { Operator } from "../../../domain/entities/operator.js";
import type { UserType } from "../../../domain/entities/user-type.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

import { createSessionContext } from "../../../async-local-storage-session-context.js";
import { Session } from "../../../domain/entities/session.js";
import { OPERATOR_USER_TYPES } from "../../../domain/entities/user-type.js";

const CALLER = "AcsUseCase";

const resolveUserType = (
  fiscalCode: string | undefined,
  config: Pick<
    AppConfig,
    | "ADMIN_FISCAL_CODES"
    | "ADMIN_FISCAL_CODES_TEST"
    | "OPERATORS_FISCAL_CODES_TEST"
  >,
): UserType => {
  if (fiscalCode === undefined) {
    return "operator";
  }

  const fiscalCodeHash = hashUppercasedString(fiscalCode);

  if (config.ADMIN_FISCAL_CODES.includes(fiscalCodeHash)) {
    return "admin";
  }
  if (config.ADMIN_FISCAL_CODES_TEST.includes(fiscalCodeHash)) {
    return "test_admin";
  }
  if (config.OPERATORS_FISCAL_CODES_TEST.includes(fiscalCodeHash)) {
    return "test_operator";
  }
  return "operator";
};

const TokenPayloadSchema = z.object({
  family_name: z.string(),
  name: z.string(),
  organization: z.object({
    fiscal_code: z.string().optional(),
    id: z.string(),
    name: z.string(),
    roles: z.array(z.object({ partyRole: z.string() })).nonempty(),
  }),
  uid: z.string(),
});

export interface AcsInput {
  readonly token: string;
}

export interface AcsOutput {
  readonly sessionId: string;
}

export const makeAcsUseCase =
  (
    sessionRepository: SessionRepository,
    operatorRepository: OperatorRepository,
    config: Pick<
      AppConfig,
      | "ADMIN_FISCAL_CODES"
      | "ADMIN_FISCAL_CODES_TEST"
      | "OPERATORS_FISCAL_CODES_TEST"
    >,
  ): UseCase<AcsInput, AcsOutput, BaseError> =>
  async (input) => {
    const rawPayload = decodeJwt(input.token);
    const parsed = TokenPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    const { family_name, name, organization, uid } = parsed.data;

    const userType = resolveUserType(organization.fiscal_code, config);
    const isOperator = OPERATOR_USER_TYPES.includes(userType);

    const sessionData: Session = {
      firstName: name,
      lastName: family_name,
      operatorExternalId: organization.id,
      operatorName: organization.name,
      referentExternalId: uid,
      role: isOperator ? organization.roles[0].partyRole : "admin",
      userType,
    };

    const sessionToken = randomBytes(32).toString("hex");
    const sessionId = randomBytes(32).toString("hex");

    const resolveOperator: ResultAsync<null | Operator, BaseError> = isOperator
      ? createSessionContext(sessionData, () =>
          new ResultAsync(
            operatorRepository.getByExternalId(organization.id),
          ).andThen((existing) =>
            existing
              ? okAsync(existing)
              : new ResultAsync(
                  operatorRepository.create({
                    externalId: organization.id,
                    id: ulid(),
                    name: organization.name,
                    status: "active",
                  }),
                ).map((operator) => {
                  emitCustomEvent("operator_created", {
                    caller: CALLER,
                    data: {
                      operatorId: operator.id,
                      operatorName: operator.name,
                    },
                  })(CALLER);
                  return operator;
                }),
          ),
        )
      : okAsync(null);

    return resolveOperator
      .andThen((operator) =>
        new ResultAsync(
          sessionRepository.createSession(
            sessionToken,
            {
              ...sessionData,
              operatorId: operator?.id,
            },
            28800,
          ),
        ).andThen(
          () =>
            new ResultAsync(
              sessionRepository.createOneTimeSessionId(
                sessionId,
                sessionToken,
                60,
              ),
            ),
        ),
      )
      .map(() => ({ sessionId }));
  };
