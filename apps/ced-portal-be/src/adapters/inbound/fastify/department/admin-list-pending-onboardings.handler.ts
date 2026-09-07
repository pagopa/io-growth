import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminListPendingOnboardingsUseCase } from "../../../../application/use-cases/department/admin-list-pending-onboardings.use-case.js";

import {
  OnboardingStatusSchema,
  PaginatedOnboardingsSchema,
} from "../../../../domain/entities/onboarding.js";
import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  listOnboardingsQueryPageDefault,
  ListOnboardingsQueryParams,
  listOnboardingsQuerySizeDefault,
  listOnboardingsQuerySizeMax,
} from "../contracts/department/department.js";

const adminListPendingOnboardingsQuerySchema =
  ListOnboardingsQueryParams.extend({
    page: zod.coerce
      .number()
      .int()
      .min(0)
      .default(listOnboardingsQueryPageDefault),
    size: zod.coerce
      .number()
      .int()
      .min(1)
      .max(listOnboardingsQuerySizeMax)
      .default(listOnboardingsQuerySizeDefault),
    statuses: zod.preprocess(
      (val) => (typeof val === "string" ? [val] : val),
      zod.array(OnboardingStatusSchema).optional(),
    ),
  });

const adminListPendingOnboardingsHttpSchema = zod.object({
  query: adminListPendingOnboardingsQuerySchema,
});

const adminListPendingOnboardingsValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    SessionSchema,
    createHttpRequestValidator(adminListPendingOnboardingsHttpSchema),
    (_session, { query }) => ({
      name: query.name,
      page: query.page,
      size: query.size,
      statuses: query.statuses,
    }),
  ),
);

const adminListPendingOnboardingsFormatter = createHttpResponseFormatter(
  PaginatedOnboardingsSchema,
);

export const mountAdminListPendingOnboardingsHandler = (
  fastify: FastifyInstance,
  useCase: AdminListPendingOnboardingsUseCase,
) => {
  fastify.get(
    "/api/department/onboardings",
    createHttpHandler(
      useCase,
      adminListPendingOnboardingsValidator,
      { successCode: 200 },
      adminListPendingOnboardingsFormatter,
    ),
  );
};
