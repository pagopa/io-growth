import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { ListOnboardingsUseCase } from "../../../../application/use-cases/department/list-onboardings.use-case.js";

import {
  OnboardingStatusSchema,
  PaginatedOnboardingsSchema,
} from "../../../../domain/entities/onboarding.js";
import { SessionSchema } from "../auth/session.js";
import {
  listOnboardingsQueryPageDefault,
  ListOnboardingsQueryParams,
  listOnboardingsQuerySizeDefault,
  listOnboardingsQuerySizeMax,
} from "../contracts/department/department.js";

const listPendingOnboardingsQuerySchema = ListOnboardingsQueryParams.extend({
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

const listPendingOnboardingsHttpSchema = zod.object({
  query: listPendingOnboardingsQuerySchema,
});

const listPendingOnboardingsValidator = withSession(
  SessionSchema,
  createHttpRequestValidator(listPendingOnboardingsHttpSchema),
  (_session, { query }) => ({
    name: query.name,
    page: query.page,
    size: query.size,
    statuses: query.statuses,
  }),
);

const listPendingOnboardingsFormatter = createHttpResponseFormatter(
  PaginatedOnboardingsSchema,
);

export const mountListPendingOnboardingsHandler = (
  fastify: FastifyInstance,
  useCase: ListOnboardingsUseCase,
) => {
  fastify.get(
    "/api/department/onboardings",
    createHttpHandler(
      useCase,
      listPendingOnboardingsValidator,
      { successCode: 200 },
      listPendingOnboardingsFormatter,
    ),
  );
};
