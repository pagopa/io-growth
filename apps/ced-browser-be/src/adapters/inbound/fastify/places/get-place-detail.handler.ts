import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetPlaceDetailUseCase } from "../../../../application/use-cases/places/get-place-detail.use-case.js";

import { CitizenSessionSchema } from "../auth/session.js";
import {
  GetPlaceDetailPathParams,
  GetPlaceDetailQueryParams,
  GetPlaceDetailResponse,
} from "../contracts/places/places.js";

const getPlaceDetailHttpSchema = z.object({
  path: GetPlaceDetailPathParams,
  query: GetPlaceDetailQueryParams,
});

const getPlaceDetailValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(getPlaceDetailHttpSchema),
  (_session, { path, query }) => ({
    language: query.language,
    placeId: path.placeId,
  }),
);

const getPlaceDetailFormatter = createHttpResponseFormatter(
  GetPlaceDetailResponse,
);

export const mountGetPlaceDetailHandler = (
  fastify: FastifyInstance,
  useCase: GetPlaceDetailUseCase,
) => {
  fastify.get(
    "/api/places/:placeId",
    createHttpHandler(
      async (input) => useCase(input),
      getPlaceDetailValidator,
      { successCode: 200 },
      getPlaceDetailFormatter,
    ),
  );
};
