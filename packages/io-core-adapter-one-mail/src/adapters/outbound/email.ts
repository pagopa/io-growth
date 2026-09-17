import {
  ConflictError,
  ForbiddenError,
  GenericError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { OneMailConfig } from "../../config.js";
import type { EmailRepository } from "../../domain/ports/outbound/email.repository.js";
import type { CustomFetch } from "../../fetch.js";
import type {
  getV1EmailsStatusesResponse,
  postV1EmailsSanitizeHtmlResponse,
  postV1EmailsSendHighResponse,
  postV1EmailsSendLowResponse,
} from "../../generated/endpoints/emails/emails.js";
import type { ErrorResponseDTO } from "../../generated/model/index.js";

import {
  getGetV1EmailsStatusesUrl,
  getPostV1EmailsSanitizeHtmlUrl,
  getPostV1EmailsSendHighUrl,
  getPostV1EmailsSendLowUrl,
} from "../../generated/endpoints/emails/emails.js";

/** Maps a non-2xx OneMail response to the shared domain error taxonomy. */
const mapErrorResponse = (
  operation: string,
  status: number,
  data: ErrorResponseDTO,
) => {
  const detail = `${operation} failed (${String(status)}): ${data.message}`;
  switch (status) {
    case 400:
      return new ValidationError(detail);
    case 401:
      return new UnauthorizedError(detail);
    case 403:
      return new ForbiddenError();
    case 404:
      return new NotFoundError("email", detail);
    case 409:
      return new ConflictError(detail);
    default:
      return new GenericError(detail);
  }
};

/**
 * Creates the OneMail Emails outbound adapter.
 *
 * `config.onEmailSent` / `config.onEmailError` are optional and, when
 * provided, are called for every email successfully accepted by OneMail and
 * for every rejected or failed send attempt respectively — the app wires
 * these to its telemetry client (see requirement: injectable tracing from
 * the app layer to log mail sent / mail errors).
 */
export const createEmailClient = (
  customFetch: CustomFetch,
  config: Pick<OneMailConfig, "onEmailError" | "onEmailSent"> = {},
): EmailRepository => ({
  getEmailStatuses: async (requestId) => {
    try {
      const response = await customFetch<getV1EmailsStatusesResponse>(
        getGetV1EmailsStatusesUrl({ requestId }),
        { method: "GET" },
      );
      if (response.status === 200) return ok(response.data);
      return err(
        mapErrorResponse("getEmailStatuses", response.status, response.data),
      );
    } catch (error) {
      return err(new GenericError(`getEmailStatuses failed: ${String(error)}`));
    }
  },

  sanitizeHtml: async (body) => {
    try {
      const response = await customFetch<postV1EmailsSanitizeHtmlResponse>(
        getPostV1EmailsSanitizeHtmlUrl(),
        { body: JSON.stringify(body), method: "POST" },
      );
      if (response.status === 200) return ok(response.data);
      return err(
        mapErrorResponse("sanitizeHtml", response.status, response.data),
      );
    } catch (error) {
      return err(new GenericError(`sanitizeHtml failed: ${String(error)}`));
    }
  },

  sendHighPriorityEmail: async (body, opts) => {
    const url = getPostV1EmailsSendHighUrl(opts);
    try {
      const response = await customFetch<postV1EmailsSendHighResponse>(url, {
        body: JSON.stringify(body),
        method: "POST",
      });
      if (response.status === 202) {
        config.onEmailSent?.({
          priority: "high",
          requestId: response.data.requestId,
        });
        return ok(response.data);
      }
      const error = mapErrorResponse(
        "sendHighPriorityEmail",
        response.status,
        response.data,
      );
      config.onEmailError?.({
        error,
        method: "POST",
        route: "/v1/emails/send/high",
        url,
      });
      return err(error);
    } catch (error) {
      const wrapped = new GenericError(
        `sendHighPriorityEmail failed: ${String(error)}`,
      );
      config.onEmailError?.({
        error: wrapped,
        method: "POST",
        route: "/v1/emails/send/high",
        url,
      });
      return err(wrapped);
    }
  },

  sendLowPriorityEmail: async (body, opts) => {
    const url = getPostV1EmailsSendLowUrl(opts);
    try {
      const response = await customFetch<postV1EmailsSendLowResponse>(url, {
        body: JSON.stringify(body),
        method: "POST",
      });
      if (response.status === 202) {
        config.onEmailSent?.({
          priority: "low",
          requestId: response.data.requestId,
        });
        return ok(response.data);
      }
      const error = mapErrorResponse(
        "sendLowPriorityEmail",
        response.status,
        response.data,
      );
      config.onEmailError?.({
        error,
        method: "POST",
        route: "/v1/emails/send/low",
        url,
      });
      return err(error);
    } catch (error) {
      const wrapped = new GenericError(
        `sendLowPriorityEmail failed: ${String(error)}`,
      );
      config.onEmailError?.({
        error: wrapped,
        method: "POST",
        route: "/v1/emails/send/low",
        url,
      });
      return err(wrapped);
    }
  },
});
