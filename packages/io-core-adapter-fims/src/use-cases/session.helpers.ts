import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { randomBytes } from "node:crypto";

import type { FimsSessionStore } from "../domain/ports.js";
import type { FimsAuthFlowConfig, FimsSession } from "../domain/types.js";

export const randomHex = (): string => randomBytes(32).toString("hex");

export const buildSessionAndRedirect = async (
  session: FimsSession,
  state: string,
  sessionStore: FimsSessionStore,
  config: FimsAuthFlowConfig,
  sessionTtl: number,
  otpTtl: number,
): Promise<Result<string, BaseError>> => {
  const sessionToken = randomHex();
  const sessionId = randomHex();

  const sessionResult = await sessionStore.storeSession(
    sessionToken,
    session,
    sessionTtl,
  );
  if (sessionResult.isErr())
    return err(new UnauthorizedError("Cannot create session"));

  const otpResult = await sessionStore.storeTemporary(
    `otp:${sessionId}`,
    sessionToken,
    otpTtl,
  );
  if (otpResult.isErr())
    return err(new UnauthorizedError("Cannot create session OTP"));

  // Optional device query param (from state stored during /fauth)
  const deviceResult = await sessionStore.getTemporary(`device:${state}`);
  const device =
    deviceResult.isOk() && deviceResult.value
      ? `&device=${deviceResult.value}`
      : "";

  return ok(`${config.baseUrl}/authorize?id=${sessionId}${device}`);
};
