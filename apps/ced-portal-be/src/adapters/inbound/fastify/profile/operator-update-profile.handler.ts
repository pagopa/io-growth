import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  createMultipartRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type {
  OperatorUpdateProfileInput,
  OperatorUpdateProfileUseCase,
} from "../../../../application/use-cases/profile/operator-update-profile.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOperatorProfileResponse,
  UpdateOperatorProfileBody,
} from "../contracts/profile/profile.js";

// PUT must reject unknown writable fields, while generated objects strip them.
const OperatorUpdateProfileBodyHttpSchema = UpdateOperatorProfileBody.extend({
  profile: UpdateOperatorProfileBody.shape.profile.strict(),
});

const operatorUpdateProfileValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createMultipartRequestValidator(OperatorUpdateProfileBodyHttpSchema),
    (session, { image, logo, profile }): OperatorUpdateProfileInput => ({
      ...profile,
      image,
      logo,
      operatorId: session.operatorId,
    }),
  ),
);

const operatorUpdateProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountOperatorUpdateProfileHandler = (
  fastify: FastifyInstance,
  useCase: OperatorUpdateProfileUseCase,
) => {
  fastify.put(
    "/api/operator/profile",
    createHttpHandler(
      useCase,
      operatorUpdateProfileValidator,
      { successCode: 200 },
      operatorUpdateProfileFormatter,
    ),
  );
};
