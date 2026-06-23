import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetPlaceDetailUseCase } from "../../../../application/use-cases/places/get-place-detail.use-case.js";

import { LANGUAGE_VALUES } from "../../../../domain/ports/outbound/persistence/place.repository.js";
import { CitizenSessionSchema } from "../auth/session.js";
import {
  GetPlaceDetailParams,
  GetPlaceDetailResponse,
} from "../contracts/places/places.js";

const getPlaceDetailHttpSchema = z.object({
  headers: z.object({
    "accept-language": z.enum(LANGUAGE_VALUES).optional(),
  }),
  path: GetPlaceDetailParams,
});

const getPlaceDetailValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(getPlaceDetailHttpSchema),
  (_session, { headers, path }) => ({
    language: headers["accept-language"],
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
