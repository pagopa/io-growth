import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetAccessPointDetailUseCase } from "../../../../application/use-cases/places/get-access-point-detail.use-case.js";

import { CitizenSessionSchema } from "../auth/session.js";
import {
  GetAccessPointDetailPathParams,
  GetAccessPointDetailQueryParams,
  GetAccessPointDetailResponse,
} from "../contracts/access-points/access-points.js";

const getAccessPointDetailHttpSchema = z.object({
  path: GetAccessPointDetailPathParams,
  query: GetAccessPointDetailQueryParams,
});

const getAccessPointDetailValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(getAccessPointDetailHttpSchema),
  (_session, { path, query }) => ({
    accessPointId: path.accessPointId,
    language: query.language,
  }),
);

const getAccessPointDetailFormatter = createHttpResponseFormatter(
  GetAccessPointDetailResponse,
);

export const mountGetAccessPointDetailHandler = (
  fastify: FastifyInstance,
  useCase: GetAccessPointDetailUseCase,
) => {
  fastify.get(
    "/api/entities/:entityId/access-points/:accessPointId",
    createHttpHandler(
      async (input) => useCase(input),
      getAccessPointDetailValidator,
      { successCode: 200 },
      getAccessPointDetailFormatter,
    ),
  );
};
