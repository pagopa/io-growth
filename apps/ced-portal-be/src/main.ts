// Side-effect import: must stay FIRST so tracing instrumentation is installed
// before any instrumented library (Fastify, PostgreSQL, Redis, fetch) loads.
import "./telemetry.js";

import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
  multipart,
} from "@pagopa/io-core-adapter-fastify";
import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";
import {
  emitCustomEvent,
  tracingPlugin,
} from "@pagopa/io-core-adapter-tracing";
import Fastify from "fastify";

import { SessionSchema } from "./adapters/inbound/fastify/auth/session.js";
import {
  mountAcsHandler,
  mountAdminListOpportunitiesHandler,
  mountApproveOpportunityHandler,
  mountAuthorizeHandler,
  mountCompleteOnboardingHandler,
  mountCreateOperatorOpportunityHandler,
  mountCreateOperatorPlaceHandler,
  mountCreateOperatorProfileHandler,
  mountGetContractSignedHandler,
  mountGetOnboardingHandler,
  mountGetOperatorOpportunityHandler,
  mountGetOperatorPlaceHandler,
  mountGetOperatorProfileHandler,
  mountGetOpportunityHandler,
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
  mountListOperatorOpportunitiesHandler,
  mountListOperatorPlacesHandler,
  mountListOpportunityCategoriesHandler,
  mountListPendingOnboardingsHandler,
  mountOperatorPublishOpportunityHandler,
  mountOperatorRequestOpportunityTestHandler,
} from "./adapters/inbound/fastify/index.js";
import { createArOnboardingRepository } from "./adapters/outbound/ar/ar-onboarding.repository.js";
import { createDrizzleMaterializedViewRepository } from "./adapters/outbound/drizzle/drizzle-materialized-view.repository.js";
import { createDrizzleOperatorRepository } from "./adapters/outbound/drizzle/drizzle-operator.repository.js";
import { createDrizzleOpportunityCategoryRepository } from "./adapters/outbound/drizzle/drizzle-opportunity-category.repository.js";
import { createDrizzleOpportunityRepository } from "./adapters/outbound/drizzle/drizzle-opportunity.repository.js";
import { createDrizzlePlaceRepository } from "./adapters/outbound/drizzle/drizzle-place.repository.js";
import { createDrizzleProfileRepository } from "./adapters/outbound/drizzle/drizzle-profile.repository.js";
import { createDrizzleHealthCheckRepository } from "./adapters/outbound/drizzle/health-check.repository.js";
import { createRedisHealthCheckRepository } from "./adapters/outbound/redis/redis-health-check.repository.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeAcsUseCase } from "./application/use-cases/auth/acs.use-case.js";
import { makeAuthorizeUseCase } from "./application/use-cases/auth/authorize.use-case.js";
import { makeCompleteOnboardingUseCase } from "./application/use-cases/department/complete-onboarding.use-case.js";
import { makeGetContractSignedUseCase } from "./application/use-cases/department/get-contract-signed.use-case.js";
import { makeGetOnboardingUseCase } from "./application/use-cases/department/get-onboarding.use-case.js";
import { makeListOnboardingsUseCase } from "./application/use-cases/department/list-onboardings.use-case.js";
import { makeGetInfoReadinessUseCase } from "./application/use-cases/health/info-readiness.use-case.js";
import { makeGetInfoStartupUseCase } from "./application/use-cases/health/info-startup.use-case.js";
import { makeAdminListOpportunitiesUseCase } from "./application/use-cases/opportunities/admin-list-opportunities.use-case.js";
import { makeApproveOpportunityUseCase } from "./application/use-cases/opportunities/approve-opportunity.use-case.js";
import { makeCreateOperatorOpportunityUseCase } from "./application/use-cases/opportunities/create-operator-opportunity.use-case.js";
import { makeGetOperatorOpportunityUseCase } from "./application/use-cases/opportunities/get-operator-opportunity.use-case.js";
import { makeGetOpportunityUseCase } from "./application/use-cases/opportunities/get-opportunity.use-case.js";
import { makeListOperatorOpportunitiesUseCase } from "./application/use-cases/opportunities/list-operator-opportunities.use-case.js";
import { makeListOpportunityCategoriesUseCase } from "./application/use-cases/opportunities/list-opportunity-categories.use-case.js";
import { makeOperatorRequestOpportunityTestUseCase } from "./application/use-cases/opportunities/operator-request-opportunity-test.use-case.js";
import { makePublishOpportunityUseCase } from "./application/use-cases/opportunities/publish-opportunity.use-case.js";
import { makeCreateOperatorPlaceUseCase } from "./application/use-cases/places/create-operator-place.use-case.js";
import { makeGetOperatorPlaceUseCase } from "./application/use-cases/places/get-operator-place.use-case.js";
import { makeListOperatorPlacesUseCase } from "./application/use-cases/places/list-operator-places.use-case.js";
import { makeCreateOperatorProfileUseCase } from "./application/use-cases/profile/create-operator-profile.use-case.js";
import { makeGetOperatorProfileUseCase } from "./application/use-cases/profile/get-operator-profile.use-case.js";
import { createSessionContextPreHandler } from "./async-local-storage-session-context.js";
import { parseConfig } from "./config.js";
import { createArRouter, createDbRouter } from "./routed-clients.js";

const config = parseConfig();

const dbRouter = createDbRouter(config);
const arClientRouter = createArRouter(config);
const db = dbRouter.getInstance();
const arClient = arClientRouter.getInstance();

const redisClient = await createResilientRedisClient({
  endpoint: config.REDIS_ENDPOINT,
  entraId: config.AZURE_CLIENT_ID
    ? { clientId: config.AZURE_CLIENT_ID }
    : undefined,
  onError: (error) => {
    emitCustomEvent("redis.connection.error", {
      caller: "RedisClient",
      data: { message: error instanceof Error ? error.message : String(error) },
    })("RedisClient");
  },
  tls: config.REDIS_TLS,
});

const dbHealthCheckRepository = createDrizzleHealthCheckRepository(db);
const redisHealthCheckRepository =
  createRedisHealthCheckRepository(redisClient);
const sessionRepository = createRedisSessionRepository(redisClient);
const operatorRepository = createDrizzleOperatorRepository(db);
const opportunityCategoryRepository =
  createDrizzleOpportunityCategoryRepository(db);
const opportunityRepository = createDrizzleOpportunityRepository(db);
const materializedViewRepository = createDrizzleMaterializedViewRepository(db);
const placeRepository = createDrizzlePlaceRepository(db);
const profileRepository = createDrizzleProfileRepository(db);
const arOnboardingRepository = createArOnboardingRepository(arClient);

const app = Fastify();

// Register telemetry plugin to auto-track every endpoint result and exception.
await app.register(tracingPlugin);

await app.register(multipart);

// Use cases
const getInfoReadinessUseCase = makeGetInfoReadinessUseCase({
  persistenceHealthCheckRepository: dbHealthCheckRepository,
  sessionStoreHealthCheckRepository: redisHealthCheckRepository,
});

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeGetInfoStartupUseCase);
mountInfoReadinessHandler(app, getInfoReadinessUseCase);
mountAcsHandler(
  app,
  makeAcsUseCase(sessionRepository, operatorRepository, config),
);
mountAuthorizeHandler(app, makeAuthorizeUseCase(sessionRepository));

// Authenticated routes scope
const authPreHandler = createAuthenticationPreHandler(
  sessionRepository.getSession,
);

app.register(async (app) => {
  app.addHook("preHandler", authPreHandler);

  // Populate per-request session context in ALS for cross-cutting concerns
  app.addHook(
    "preHandler",
    createSessionContextPreHandler((req) =>
      getSessionFromRequest(req, SessionSchema),
    ),
  );

  // Mount authenticated route handlers here
  mountGetOperatorProfileHandler(
    app,
    makeGetOperatorProfileUseCase(profileRepository),
  );
  mountCreateOperatorProfileHandler(
    app,
    makeCreateOperatorProfileUseCase(profileRepository),
  );
  mountListOperatorPlacesHandler(
    app,
    makeListOperatorPlacesUseCase(placeRepository),
  );
  mountCreateOperatorPlaceHandler(
    app,
    makeCreateOperatorPlaceUseCase(placeRepository),
  );
  mountGetOperatorPlaceHandler(
    app,
    makeGetOperatorPlaceUseCase(placeRepository),
  );
  mountCreateOperatorOpportunityHandler(
    app,
    makeCreateOperatorOpportunityUseCase({
      operatorRepository,
      opportunityCategoryRepository,
      opportunityRepository,
      placeRepository,
    }),
  );
  mountGetOperatorOpportunityHandler(
    app,
    makeGetOperatorOpportunityUseCase(opportunityRepository),
  );
  mountAdminListOpportunitiesHandler(
    app,
    makeAdminListOpportunitiesUseCase(opportunityRepository),
  );
  mountListOperatorOpportunitiesHandler(
    app,
    makeListOperatorOpportunitiesUseCase(opportunityRepository),
  );
  mountListOpportunityCategoriesHandler(
    app,
    makeListOpportunityCategoriesUseCase(opportunityCategoryRepository),
  );
  mountOperatorRequestOpportunityTestHandler(
    app,
    makeOperatorRequestOpportunityTestUseCase(
      opportunityRepository,
      profileRepository,
    ),
  );
  mountOperatorPublishOpportunityHandler(
    app,
    makePublishOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
      profileRepository,
    ),
  );
  mountListPendingOnboardingsHandler(
    app,
    makeListOnboardingsUseCase(
      arOnboardingRepository,
      opportunityRepository,
      config.CED_PRODUCT_ID,
    ),
  );
  mountCompleteOnboardingHandler(
    app,
    makeCompleteOnboardingUseCase(arOnboardingRepository),
  );
  mountGetContractSignedHandler(
    app,
    makeGetContractSignedUseCase(arOnboardingRepository),
  );
  mountGetOnboardingHandler(
    app,
    makeGetOnboardingUseCase(arOnboardingRepository),
  );
  mountGetOpportunityHandler(
    app,
    makeGetOpportunityUseCase(opportunityRepository),
  );
  mountApproveOpportunityHandler(
    app,
    makeApproveOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
    ),
  );
});

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await Promise.all(
    dbRouter.instances.map((instance) => instance.closeConnection()),
  );
});

await app.listen({ host: config.HOST, port: config.PORT });

console.log(`Server listening on http://${config.HOST}:${config.PORT}`);
