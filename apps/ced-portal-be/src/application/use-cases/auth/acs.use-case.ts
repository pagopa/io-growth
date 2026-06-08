import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { hashFiscalCode } from "@pagopa/io-core-adapter-fims";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { ValidationError } from "@pagopa/io-core-domain/errors";
import { decodeJwt } from "jose";
import { err, okAsync, ResultAsync } from "neverthrow";
import { randomBytes } from "node:crypto";
import { ulid } from "ulid";
import { z } from "zod";

import type { AppConfig } from "../../../config.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

const CALLER = "AcsUseCase";

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
    const token = input.token;

    // TODO: verify token signature — for now every token is considered valid

    const rawPayload = decodeJwt(token);
    const parsed = TokenPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    const { family_name, name, organization, uid } = parsed.data;

    const userType =
      organization.fiscal_code !== undefined &&
      config.ADMIN_FISCAL_CODES.includes(
        hashFiscalCode(organization.fiscal_code),
      )
        ? "admin"
        : "operator";

    const sessionToken = randomBytes(32).toString("hex");
    const sessionId = randomBytes(32).toString("hex");

    if (userType === "admin") {
      return new ResultAsync(
        sessionRepository.createSession(sessionToken, {
          firstName: name,
          lastName: family_name,
          operatorId: "",
          operatorName: organization.name,
          referentExternalId: uid,
          role: "admin",
          userType,
        }),
      )
        .andThen(
          () =>
            new ResultAsync(
              sessionRepository.createOneTimeSessionId(
                sessionId,
                sessionToken,
                60,
              ),
            ),
        )
        .map(() => ({ sessionId }));
    }

    return new ResultAsync(operatorRepository.getByExternalId(organization.id))
      .andThen((existingOperator) =>
        existingOperator
          ? okAsync(existingOperator)
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
                data: JSON.stringify({
                  operatorId: operator.id,
                  operatorName: operator.name,
                }),
              })(CALLER);
              return operator;
            }),
      )
      .andThen((operator) =>
        new ResultAsync(
          sessionRepository.createSession(sessionToken, {
            firstName: name,
            lastName: family_name,
            operatorId: operator.id,
            operatorName: operator.name,
            referentExternalId: uid,
            role: organization.roles[0].partyRole,
            userType: "operator",
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
