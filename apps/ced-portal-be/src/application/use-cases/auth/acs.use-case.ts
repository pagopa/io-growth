import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { hashUppercasedString } from "@pagopa/io-core-domain/utilities";
import { decodeJwt } from "jose";
import { err, okAsync, ResultAsync } from "neverthrow";
import { randomBytes } from "node:crypto";
import { ulid } from "ulid";
import { z } from "zod";

import type { AppConfig } from "../../../config.js";
import type { Operator } from "../../../domain/entities/operator.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

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
    config: Pick<AppConfig, "ADMIN_FISCAL_CODES">,
  ): UseCase<AcsInput, AcsOutput, BaseError> =>
  async (input) => {
    const rawPayload = decodeJwt(input.token);
    const parsed = TokenPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    const { family_name, name, organization, uid } = parsed.data;

    const userType =
      organization.fiscal_code !== undefined &&
      config.ADMIN_FISCAL_CODES.includes(
        hashUppercasedString(organization.fiscal_code),
      )
        ? "admin"
        : "operator";

    const sessionToken = randomBytes(32).toString("hex");
    const sessionId = randomBytes(32).toString("hex");

    const resolveOperator: ResultAsync<null | Operator, BaseError> =
      userType === "operator"
        ? new ResultAsync(
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
                ),
          )
        : okAsync(null);

    return resolveOperator
      .andThen((operator) =>
        new ResultAsync(
          sessionRepository.createSession(sessionToken, {
            firstName: name,
            lastName: family_name,
            operatorExternalId: organization.id,
            operatorId: operator?.id,
            operatorName: operator?.name ?? organization.name,
            referentExternalId: uid,
            role: operator ? organization.roles[0].partyRole : "admin",
            userType,
          }),
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
