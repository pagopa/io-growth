import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { err } from "neverthrow";

import type { FimsAuthFlowConfig } from "../../domain/entities.js";
import type { OidcClient } from "../../domain/ports/outbound/oidc-client.repository.js";
import type { FimsSessionStore } from "../../domain/ports/outbound/session.repository.js";

import { randomHex } from "./session.helpers.js";

const DEFAULT_OTP_TTL = 60;

export type InitiateAuth = UseCase<{ device?: string }, string, BaseError>;

export const createInitiateAuth = (
  oidcClient: OidcClient,
  sessionStore: FimsSessionStore,
  config: Pick<FimsAuthFlowConfig, "otpTtlSeconds">,
): InitiateAuth => {
  const otpTtl = config.otpTtlSeconds ?? DEFAULT_OTP_TTL;

  return async ({ device }) => {
    const state = randomHex();
    const nonce = randomHex();

    const nonceResult = await sessionStore.storeTemporary(
      `nonce:${state}`,
      nonce,
      otpTtl,
    );
    if (nonceResult.isErr()) return err(nonceResult.error);

    if (device) {
      const deviceResult = await sessionStore.storeTemporary(
        `device:${state}`,
        device,
        otpTtl,
      );
      if (deviceResult.isErr()) return err(deviceResult.error);
    }

    return oidcClient.getAuthorizationUrl(state, nonce);
  };
};
