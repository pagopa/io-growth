# Plan: Extract FIMS SSO into `io-core-adapter-fims` + implement in both backends

**TL;DR**: Create `packages/io-core-adapter-fims` encapsulating FIMS OIDC SSO logic (OIDC client, lollipop verification, test user bypass), then integrate into both `ced-browser-be` and `ced-card-request-be`. Add a `/test-session` public endpoint guarded by test-user SHA check. Reimplements [pagopa/io-cdc backend-func](https://github.com/pagopa/io-cdc/tree/main/apps/backend-func) with `neverthrow`, Fastify, and hexagonal architecture.

---

## Phase 1: Create `packages/io-core-adapter-fims`

1. **Scaffold package** — `package.json`, `tsconfig.json`, `eslint.config.mjs`, `vite.config.mts` (template from `io-core-adapter-redis`). Deps: `openid-client`, `jose`, `neverthrow`, `zod`, peer on `@pagopa/io-core-domain`
2. **Port interface** (`src/ports.ts`) — define `FimsSessionStore` with `storeSession`, `getSession`, `storeTemporary`, `getTemporary`, `deleteTemporary` — all return `Result`
3. **Domain types** (`src/types.ts`) — `FimsSession`, `OidcConfig`, `FimsUser`, `LollipopHeaders`
4. **OIDC client** (`src/oidc-client.ts`) — `createOidcClient(config)` → `{ getAuthorizationUrl, exchangeCode }` wrapping `openid-client`
5. **Lollipop verification** (`src/lollipop.ts`) — full parity with io-cdc: assertion sig, HTTP sig, assertion ref, CF match, issue instant check
6. **Flow orchestration** (`src/flows.ts`) — `createFimsAuthFlow(oidcClient, sessionStore, config)` → `{ initiateAuth, handleCallback, exchangeSessionId, createTestSession }`
7. **Test user utils** (`src/test-users.ts`) — `isTestUser(list, sha)`, `hashFiscalCode(cf)`
8. **Package exports** (`src/index.ts`) — all types + functions, no technology prefix per adapter conventions
9. **Unit tests** — mock openid-client and session store, test all flow paths

---

## Phase 2: Bootstrap `ced-browser-be`

1. **Package setup** — `package.json` with Fastify + all `@pagopa/io-core-*` deps
2. **Config** (`src/config.ts`) — Zod schema: FIMS vars, REDIS vars, `TEST_USERS`, `BASE_URL`, `PAGOPA_IDP_KEYS_BASE_URL`
3. **Session store adapter** (`adapters/outbound/redis/session-store.redis.ts`) — implements `FimsSessionStore` via `@pagopa/io-core-adapter-redis`
4. **Use cases** — thin wrappers: `makeFimsAuthUseCase`, `makeFimsCallbackUseCase`, `makeAuthorizeUseCase`, `makeTestSessionUseCase`
5. **Handlers** — `mountFimsAuthHandler` (302), `mountFimsCallbackHandler` (302), `mountAuthorizeHandler` (200 JSON), `mountTestSessionHandler` (302 or 403)
6. **Composition root** (`main.ts`) — Redis → store → OIDC client → flow → use cases → handlers
7. **OpenAPI update** — add `/test-session` endpoint spec

---

## Phase 3: Bootstrap `ced-card-request-be`

1. **Mirror auth layer** from Phase 2 (identical structure, different FIMS config values)
2. **OpenAPI update** — add `/fauth`, `/fcb`, `/authorize`, `/test-session` endpoints
3. **Consider** exporting `mountFimsRoutes(fastify, deps)` from adapter to reduce duplication across both apps

---

## Phase 4: Integration

1. Workspace already covers new package via `packages/*` glob
2. Add `openid-client` + `jose` to pnpm catalog if used in multiple packages

---

## Relevant files

| File                                                    | Role                                               |
| ------------------------------------------------------- | -------------------------------------------------- |
| `packages/io-core-adapter-redis/`                       | Package scaffold template                          |
| `packages/io-core-adapter-fastify/src/`                 | Handler utilities reference                        |
| `packages/io-core-domain/src/errors/`                   | `BaseError`, `UnauthorizedError`, `ForbiddenError` |
| `apps/ced-portal-be/src/main.ts`                        | Composition root pattern                           |
| `apps/ced-browser-be/openapi/exposed/openapi.yaml`      | Auth endpoints already spec'd                      |
| `apps/ced-card-request-be/openapi/exposed/openapi.yaml` | Needs auth endpoints added                         |

---

## Verification

1. `pnpm typecheck` — all compiles
2. `pnpm lint --fix` — no lint errors
3. `pnpm test` — unit tests pass
4. `pnpm --filter=io-core-adapter-fims test:coverage` — new package coverage
5. Manual: `GET /test-session?fiscalCodeSha=<known>` → 302 → `GET /authorize?id=...` → `{ token }`
6. Manual: `GET /test-session?fiscalCodeSha=<unknown>` → 403

---

## Decisions

- **openid-client** for OIDC (same as io-cdc, proven)
- **Port-based `FimsSessionStore`** — apps inject their own Redis implementation; testable without Redis
- **Full lollipop checks** — assertion sig, HTTP sig, ref match, CF match, issue instant
- **Test users** — SHA-256 hashes in `TEST_USERS` env var (same as io-cdc)
- **Both apps** get their own endpoints (separate FIMS registrations)
- **No `route` concept** — unlike io-cdc, these apps each serve a single purpose
- **Session TTLs** — configurable, defaults: 1800s session token, 60s one-time ID

---

## Further Considerations

1. **Audit logging**: io-cdc stores FIMS/lollipop audit logs in Blob Storage. Recommend defining an optional `AuditLogger` port now, implement later.
2. **Convenience `mountFimsRoutes`**: Since both apps wire identical auth routes, the adapter could export a Fastify plugin that registers all 4 routes given a `fimsAuthFlow` — reduces boilerplate. Tradeoff: tighter coupling to Fastify in the adapter. Alternative: keep it in a shared file within each app.
3. **SAML parsing dependency**: Lollipop requires XML/SAML parsing (io-cdc uses native `DOMParser`). In Node.js this needs `xmldom` or similar. Add to adapter deps.
