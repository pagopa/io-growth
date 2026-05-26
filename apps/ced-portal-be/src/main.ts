import multipart from "@fastify/multipart";
import {
  createDocumentContentClient,
  createInstitutionClient,
  createOnboardingClient,
} from "@pagopa/io-core-adapter-ar";
import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { createAuthenticationPreHandler } from "@pagopa/io-core-adapter-fastify";
import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";
import Fastify from "fastify";

import {
  mountAcsHandler,
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
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
  mountListOperatorOpportunitiesHandler,
  mountListOperatorPlacesHandler,
  mountListOpportunityCategoriesHandler,
  mountListPendingOnboardingsHandler,
  mountOperatorRequestOpportunityTestHandler,
} from "./adapters/inbound/fastify/index.js";
import { createArOnboardingRepository } from "./adapters/outbound/ar/ar-onboarding.repository.js";
import { createDrizzleOperatorRepository } from "./adapters/outbound/drizzle/drizzle-operator.repository.js";
import { createDrizzleOpportunityCategoryRepository } from "./adapters/outbound/drizzle/drizzle-opportunity-category.repository.js";
import { createDrizzleOpportunityRepository } from "./adapters/outbound/drizzle/drizzle-opportunity.repository.js";
import { createDrizzlePlaceRepository } from "./adapters/outbound/drizzle/drizzle-place.repository.js";
import { createDrizzleProfileRepository } from "./adapters/outbound/drizzle/drizzle-profile.repository.js";
import { createDrizzleHealthCheckRepository } from "./adapters/outbound/drizzle/health-check.repository.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
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
import { makeCreateOperatorOpportunityUseCase } from "./application/use-cases/opportunities/create-operator-opportunity.use-case.js";
import { makeGetOperatorOpportunityUseCase } from "./application/use-cases/opportunities/get-operator-opportunity.use-case.js";
import { makeListOperatorOpportunitiesUseCase } from "./application/use-cases/opportunities/list-operator-opportunities.use-case.js";
import { makeListOpportunityCategoriesUseCase } from "./application/use-cases/opportunities/list-opportunity-categories.use-case.js";
import { makeOperatorRequestOpportunityTestUseCase } from "./application/use-cases/opportunities/operator-request-opportunity-test.use-case.js";
import { makeCreateOperatorPlaceUseCase } from "./application/use-cases/places/create-operator-place.use-case.js";
import { makeGetOperatorPlaceUseCase } from "./application/use-cases/places/get-operator-place.use-case.js";
import { makeListOperatorPlacesUseCase } from "./application/use-cases/places/list-operator-places.use-case.js";
import { makeCreateOperatorProfileUseCase } from "./application/use-cases/profile/create-operator-profile.use-case.js";
import { makeGetOperatorProfileUseCase } from "./application/use-cases/profile/get-operator-profile.use-case.js";
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
const placeRepository = createDrizzlePlaceRepository(dbClient);
const profileRepository = createDrizzleProfileRepository(dbClient);
const arOnboardingRepository = createArOnboardingRepository(
  createInstitutionClient(arClientConfig),
  createOnboardingClient(arClientConfig),
  createDocumentContentClient(arClientConfig),
);

const app = Fastify();

await app.register(multipart);

// Use cases
const getInfoReadinessUseCase = makeGetInfoReadinessUseCase({
  persistenceHealthCheckRepository: dbHealthCheckRepository,
  sessionStoreHealthCheckRepository: redisHealthCheckRepository,
});

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeGetInfoStartupUseCase);
mountInfoReadinessHandler(app, getInfoReadinessUseCase);
mountAcsHandler(app, makeAcsUseCase(sessionRepository, operatorRepository));
mountAuthorizeHandler(app, makeAuthorizeUseCase(sessionRepository));

// Authenticated routes scope
const authPreHandler = createAuthenticationPreHandler(
  sessionRepository.getSession,
);

app.register(async (app) => {
  app.addHook("preHandler", authPreHandler);
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
    makeOperatorRequestOpportunityTestUseCase(opportunityRepository),
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
});

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await dbClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });

console.log(`Server listening on http://${config.HOST}:${config.PORT}`);
