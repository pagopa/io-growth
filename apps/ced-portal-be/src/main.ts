// Side-effect import: must stay FIRST so tracing instrumentation is installed
// before any instrumented library (Fastify, PostgreSQL, Redis, fetch) loads.
import "./telemetry.js";

import {
  createDocumentContentClient,
  createInstitutionClient,
  createOnboardingClient,
  createUserClient,
} from "@pagopa/io-core-adapter-ar";
import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
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
  mountAdminApproveOpportunityHandler,
  mountAdminCancelScheduledSuspensionHandler,
  mountAdminCompleteOnboardingHandler,
  mountAdminGetContractSignedHandler,
  mountAdminGetOnboardingHandler,
  mountAdminGetOpportunityHandler,
  mountAdminListOpportunitiesHandler,
  mountAdminListPendingOnboardingsHandler,
  mountAdminSuspendOpportunityHandler,
  mountAuthorizeHandler,
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
  mountOperatorCancelScheduledSuspensionHandler,
  mountOperatorCreateOpportunityHandler,
  mountOperatorCreatePlaceHandler,
  mountOperatorCreateProfileHandler,
  mountOperatorDeleteOpportunityHandler,
  mountOperatorGetOpportunityHandler,
  mountOperatorGetPlaceHandler,
  mountOperatorGetProfileHandler,
  mountOperatorListOpportunitiesHandler,
  mountOperatorListOpportunityCategoriesHandler,
  mountOperatorListPlacesHandler,
  mountOperatorPublishOpportunityHandler,
  mountOperatorRequestOpportunityTestHandler,
  mountOperatorSuspendOpportunityHandler,
  mountOperatorUpdateOpportunityHandler,
} from "./adapters/inbound/fastify/index.js";
import { createArOnboardingRepository } from "./adapters/outbound/ar/ar-onboarding.repository.js";
import { injectDbAuditContext } from "./adapters/outbound/drizzle/drizzle-audit-context.js";
import { createDrizzleHealthCheckRepository } from "./adapters/outbound/drizzle/drizzle-health-check.repository.js";
import { createDrizzleMaterializedViewRepository } from "./adapters/outbound/drizzle/drizzle-materialized-view.repository.js";
import { createDrizzleOperatorRepository } from "./adapters/outbound/drizzle/drizzle-operator.repository.js";
import { createDrizzleOpportunityCategoryRepository } from "./adapters/outbound/drizzle/drizzle-opportunity-category.repository.js";
import { createDrizzleOpportunityRepository } from "./adapters/outbound/drizzle/drizzle-opportunity.repository.js";
import { createDrizzlePlaceRepository } from "./adapters/outbound/drizzle/drizzle-place.repository.js";
import { createDrizzleProfileRepository } from "./adapters/outbound/drizzle/drizzle-profile.repository.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { createRedisHealthCheckRepository } from "./adapters/outbound/redis/redis-health-check.repository.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeAcsUseCase } from "./application/use-cases/auth/acs.use-case.js";
import { makeAuthorizeUseCase } from "./application/use-cases/auth/authorize.use-case.js";
import { makeAdminCompleteOnboardingUseCase } from "./application/use-cases/department/admin-complete-onboarding.use-case.js";
import { makeAdminGetContractSignedUseCase } from "./application/use-cases/department/admin-get-contract-signed.use-case.js";
import { makeAdminGetOnboardingUseCase } from "./application/use-cases/department/admin-get-onboarding.use-case.js";
import { makeAdminListPendingOnboardingsUseCase } from "./application/use-cases/department/admin-list-pending-onboardings.use-case.js";
import { makeInfoReadinessUseCase } from "./application/use-cases/health/info-readiness.use-case.js";
import { makeInfoStartupUseCase } from "./application/use-cases/health/info-startup.use-case.js";
import { makeAdminApproveOpportunityUseCase } from "./application/use-cases/opportunities/admin-approve-opportunity.use-case.js";
import { makeAdminCancelScheduledSuspensionUseCase } from "./application/use-cases/opportunities/admin-cancel-scheduled-suspension.use-case.js";
import { makeAdminGetOpportunityUseCase } from "./application/use-cases/opportunities/admin-get-opportunity.use-case.js";
import { makeAdminListOpportunitiesUseCase } from "./application/use-cases/opportunities/admin-list-opportunities.use-case.js";
import { makeAdminSuspendOpportunityUseCase } from "./application/use-cases/opportunities/admin-suspend-opportunity.use-case.js";
import { makeOperatorCancelScheduledSuspensionUseCase } from "./application/use-cases/opportunities/operator-cancel-scheduled-suspension.use-case.js";
import { makeOperatorCreateOpportunityUseCase } from "./application/use-cases/opportunities/operator-create-opportunity.use-case.js";
import { makeOperatorDeleteOpportunityUseCase } from "./application/use-cases/opportunities/operator-delete-opportunity.use-case.js";
import { makeOperatorGetOpportunityUseCase } from "./application/use-cases/opportunities/operator-get-opportunity.use-case.js";
import { makeOperatorListOpportunitiesUseCase } from "./application/use-cases/opportunities/operator-list-opportunities.use-case.js";
import { makeOperatorListOpportunityCategoriesUseCase } from "./application/use-cases/opportunities/operator-list-opportunity-categories.use-case.js";
import { makeOperatorPublishOpportunityUseCase } from "./application/use-cases/opportunities/operator-publish-opportunity.use-case.js";
import { makeOperatorRequestOpportunityTestUseCase } from "./application/use-cases/opportunities/operator-request-opportunity-test.use-case.js";
import { makeOperatorSuspendOpportunityUseCase } from "./application/use-cases/opportunities/operator-suspend-opportunity.use-case.js";
import { makeOperatorUpdateOpportunityUseCase } from "./application/use-cases/opportunities/operator-update-opportunity.use-case.js";
import { makeOperatorCreatePlaceUseCase } from "./application/use-cases/places/operator-create-place.use-case.js";
import { makeOperatorGetPlaceUseCase } from "./application/use-cases/places/operator-get-place.use-case.js";
import { makeOperatorListPlacesUseCase } from "./application/use-cases/places/operator-list-places.use-case.js";
import { makeOperatorCreateProfileUseCase } from "./application/use-cases/profile/operator-create-profile.use-case.js";
import { makeOperatorGetProfileUseCase } from "./application/use-cases/profile/operator-get-profile.use-case.js";
import { createSessionContextPreHandler } from "./async-local-storage-session-context.js";
import { parseConfig } from "./config.js";

const config = parseConfig();

const arClientConfig = {
  baseUrl: config.AR_ENDPOINT,
  subscriptionKey: config.AR_API_KEY,
};

const dbClient = createTypedDbClient(
  {
    database: config.POSTGRES_DB,
    host: config.POSTGRES_HOST,
    max: config.POSTGRES_MAX_CONNECTIONS,
    onNotice: (notice) => {
      emitCustomEvent("database.notice", {
        caller: "DrizzleClient",
        data: { message: notice.message },
      })("DrizzleClient");
    },
    onTransaction: injectDbAuditContext,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  },
  schema,
);

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

const dbHealthCheckRepository = createDrizzleHealthCheckRepository(dbClient);
const redisHealthCheckRepository =
  createRedisHealthCheckRepository(redisClient);
const sessionRepository = createRedisSessionRepository(redisClient);
const operatorRepository = createDrizzleOperatorRepository(dbClient);
const opportunityCategoryRepository =
  createDrizzleOpportunityCategoryRepository(dbClient);
const opportunityRepository = createDrizzleOpportunityRepository(dbClient);
const materializedViewRepository =
  createDrizzleMaterializedViewRepository(dbClient);
const placeRepository = createDrizzlePlaceRepository(dbClient);
const profileRepository = createDrizzleProfileRepository(dbClient);
const arOnboardingRepository = createArOnboardingRepository(
  createInstitutionClient(arClientConfig),
  createOnboardingClient(arClientConfig),
  createDocumentContentClient(arClientConfig),
  createUserClient(arClientConfig),
);

const app = Fastify();

// Register telemetry plugin to auto-track every endpoint result and exception.
await app.register(tracingPlugin);

await app.register(multipart);

// Use cases
const infoReadinessUseCase = makeInfoReadinessUseCase({
  persistenceHealthCheckRepository: dbHealthCheckRepository,
  sessionStoreHealthCheckRepository: redisHealthCheckRepository,
});

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeInfoStartupUseCase);
mountInfoReadinessHandler(app, infoReadinessUseCase);
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
  mountOperatorGetProfileHandler(
    app,
    makeOperatorGetProfileUseCase(profileRepository),
  );
  mountOperatorCreateProfileHandler(
    app,
    makeOperatorCreateProfileUseCase(profileRepository),
  );
  mountOperatorListPlacesHandler(
    app,
    makeOperatorListPlacesUseCase(placeRepository),
  );
  mountOperatorCreatePlaceHandler(
    app,
    makeOperatorCreatePlaceUseCase(placeRepository),
  );
  mountOperatorGetPlaceHandler(
    app,
    makeOperatorGetPlaceUseCase(placeRepository),
  );
  mountOperatorCreateOpportunityHandler(
    app,
    makeOperatorCreateOpportunityUseCase({
      operatorRepository,
      opportunityCategoryRepository,
      opportunityRepository,
      placeRepository,
    }),
  );
  mountOperatorUpdateOpportunityHandler(
    app,
    makeOperatorUpdateOpportunityUseCase({
      materializedViewRepository,
      operatorRepository,
      opportunityCategoryRepository,
      opportunityRepository,
      placeRepository,
    }),
  );
  mountOperatorGetOpportunityHandler(
    app,
    makeOperatorGetOpportunityUseCase(opportunityRepository),
  );
  mountAdminListOpportunitiesHandler(
    app,
    makeAdminListOpportunitiesUseCase(opportunityRepository),
  );
  mountOperatorListOpportunitiesHandler(
    app,
    makeOperatorListOpportunitiesUseCase(opportunityRepository),
  );
  mountOperatorListOpportunityCategoriesHandler(
    app,
    makeOperatorListOpportunityCategoriesUseCase(opportunityCategoryRepository),
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
    makeOperatorPublishOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
      profileRepository,
    ),
  );
  mountOperatorDeleteOpportunityHandler(
    app,
    makeOperatorDeleteOpportunityUseCase(opportunityRepository),
  );
  mountOperatorSuspendOpportunityHandler(
    app,
    makeOperatorSuspendOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
    ),
  );
  mountOperatorCancelScheduledSuspensionHandler(
    app,
    makeOperatorCancelScheduledSuspensionUseCase(opportunityRepository),
  );
  mountAdminListPendingOnboardingsHandler(
    app,
    makeAdminListPendingOnboardingsUseCase(
      arOnboardingRepository,
      opportunityRepository,
      config.CED_PRODUCT_ID,
    ),
  );
  mountAdminCompleteOnboardingHandler(
    app,
    makeAdminCompleteOnboardingUseCase(arOnboardingRepository),
  );
  mountAdminGetContractSignedHandler(
    app,
    makeAdminGetContractSignedUseCase(arOnboardingRepository),
  );
  mountAdminGetOnboardingHandler(
    app,
    makeAdminGetOnboardingUseCase(arOnboardingRepository),
  );
  mountAdminGetOpportunityHandler(
    app,
    makeAdminGetOpportunityUseCase(opportunityRepository),
  );
  mountAdminApproveOpportunityHandler(
    app,
    makeAdminApproveOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
    ),
  );
  mountAdminSuspendOpportunityHandler(
    app,
    makeAdminSuspendOpportunityUseCase(
      opportunityRepository,
      materializedViewRepository,
    ),
  );
  mountAdminCancelScheduledSuspensionHandler(
    app,
    makeAdminCancelScheduledSuspensionUseCase(opportunityRepository),
  );
});

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await dbClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });

console.log(`Server listening on http://${config.HOST}:${config.PORT}`);
