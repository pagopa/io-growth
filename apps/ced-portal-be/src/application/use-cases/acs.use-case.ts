import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { decodeJwt } from "jose";
import { err, okAsync, ResultAsync } from "neverthrow";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import type { OperatorStore } from "../ports/operator-store.port.js";
import type { SessionStore } from "../ports/session-store.port.js";

const TokenPayloadSchema = z.object({
  family_name: z.string(),
  name: z.string(),
  organization: z.object({
    id: z.string(),
    name: z.string(),
    roles: z.array(z.object({ partyRole: z.string() })).nonempty(),
  }),
  uid: z.string(),
});

export interface AcsInput {
  readonly query: {
    readonly token: string;
  };
}

export interface AcsOutput {
  readonly url: string;
}

export const makeAcsUseCase =
  (
    sessionStore: SessionStore,
    operatorStore: OperatorStore,
  ): UseCase<AcsInput, AcsOutput, BaseError> =>
  async (input) => {
    const token = input.query.token;

    // TODO: verify token signature — for now every token is considered valid

    const rawPayload = decodeJwt(token);
    const parsed = TokenPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.message));
    }

    const { family_name, name, organization, uid } = parsed.data;

    const sessionToken = randomBytes(32).toString("hex");
    const sessionId = randomBytes(32).toString("hex");

    return new ResultAsync(operatorStore.getByExternalId(organization.id))
      .andThen((existingOperator) =>
        existingOperator
          ? okAsync(existingOperator)
          : new ResultAsync(
              operatorStore.create({
                externalId: organization.id,
                name: organization.name,
                status: "active",
              }),
            ),
      )
      .andThen((operator) =>
        new ResultAsync(
          sessionStore.createSession(sessionToken, {
            firstName: name,
            lastName: family_name,
            operatorId: operator.id,
            operatorName: operator.name,
            referentExternalId: uid,
            role: organization.roles[0].partyRole,
          }),
        ).andThen(
          () =>
            new ResultAsync(
              sessionStore.createOneTimeSessionId(sessionId, sessionToken, 60),
            ),
        ),
      )
      .map(() => ({ url: "/api/authorize?id=" + sessionId }));
  };
