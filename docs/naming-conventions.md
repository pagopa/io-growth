# Backend Naming Conventions (actor–verb–object)

Extracted from `apps/ced-portal-be`. All backend apps (`apps/*-be`) follow
**hexagonal (ports & adapters) architecture**, and these rules apply to every
layer. The canonical naming pattern is **`actor-verb-object`**.

> This document is the source of truth for the naming skill. It records the
> intended rules in §1–§8 and the **accepted** deviations in §9, so the skill can
> both generate correct names and flag violations.

---

## 1. Core principle: `actor-verb-object`

Every operation-oriented artifact (use case, HTTP handler, and the symbols they
export) is named as an ordered triple:

```
<actor>-<verb>-<object>
```

| Slot     | Meaning                                       | Casing in file names | Examples                                                                                                      |
| -------- | --------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `actor`  | Who initiates the operation (the caller/role) | kebab-case           | `admin`, `operator`, `department`                                                                             |
| `verb`   | The action performed                          | kebab-case           | `create`, `get`, `list`, `update`, `delete`, `suspend`, `publish`, `approve`, `cancel`, `complete`, `request` |
| `object` | The domain entity/resource acted upon         | kebab-case           | `opportunity`, `place`, `profile`, `onboarding`, `scheduled-suspension`, `opportunity-category`               |

### Sub-rules

1. **Actor comes first.** `admin-suspend-opportunity`, not
   `suspend-admin-opportunity` or `create-operator-opportunity`.
2. **Object is singular for single-item operations**
   (`admin-get-opportunity`, `operator-suspend-opportunity`).
3. **Object is plural for collection/`list` operations**
   (`admin-list-opportunities`, `operator-list-places`).
4. **Multi-word objects stay kebab-cased** and keep their internal order
   (`scheduled-suspension`, `opportunity-category`, `opportunity-test`).
5. **Omit the actor only when the operation has no meaningful actor**
   (infrastructure/technical operations such as `health`/`auth`:
   `info-readiness`, `info-startup`, `acs`, `authorize`). Do **not** omit the
   actor for a role-specific business operation.
6. **When the same verb-object exists for multiple actors, keep both actors
   explicit** (`admin-suspend-opportunity` **and**
   `operator-suspend-opportunity`).

---

## 2. Folder naming

Folders group artifacts by **domain** (the bounded context), not by actor.

- **Casing:** kebab-case, lowercase.
- **Grouping folders** use the domain name: `auth/`, `department/`, `health/`,
  `opportunities/`, `places/`, `profile/`.
- **Structural folders** are fixed by the architecture and must not be renamed:
  `domain/`, `domain/entities/`, `domain/ports/outbound/`,
  `domain/ports/outbound/persistence/`, `application/use-cases/`,
  `adapters/inbound/fastify/`, `adapters/outbound/<technology>/`,
  `contracts/`, `schema/`, `__tests__/`.

**Rule:** the domain folder name should match the use-case folder and the
inbound-handler folder for the same context (e.g. `opportunities/` appears under
both `application/use-cases/` and `adapters/inbound/fastify/`).

> ℹ️ Domain folders mix singular and plural (`opportunities/`, `places/` are
> plural; `profile/`, `department/` are singular). This is an **accepted
> deviation** (see §9): each domain keeps its own form, and that form must be
> identical across every layer. (Entities are always singular — see §6.)

---

## 3. File naming per layer

Each file uses a **layer suffix** after the `actor-verb-object` (or
`verb-object`) base name.

| Layer              | Location                                    | File pattern                               | Example                                                            |
| ------------------ | ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Domain entity      | `domain/entities/`                          | `<object>.ts` (singular)                   | `opportunity.ts`, `opportunity-category.ts`                        |
| Outbound port      | `domain/ports/outbound/[persistence/]`      | `<object>.repository.ts`                   | `opportunity.repository.ts`, `session.repository.ts`               |
| Use case           | `application/use-cases/<domain>/`           | `<actor>-<verb>-<object>.use-case.ts`      | `admin-suspend-opportunity.use-case.ts`                            |
| Use-case test      | `application/use-cases/<domain>/__tests__/` | `<actor>-<verb>-<object>.use-case.test.ts` | `admin-suspend-opportunity.use-case.test.ts`                       |
| Inbound handler    | `adapters/inbound/fastify/<domain>/`        | `<actor>-<verb>-<object>.handler.ts`       | `admin-suspend-opportunity.handler.ts`                             |
| Outbound adapter   | `adapters/outbound/<technology>/`           | `<technology>-<object>.repository.ts`      | `drizzle-opportunity.repository.ts`, `redis-session.repository.ts` |
| Row mapper         | `adapters/outbound/<technology>/`           | `<object>-row.mapper.ts`                   | `opportunity-row.mapper.ts`                                        |
| Transaction helper | `adapters/outbound/<technology>/`           | `<object>.transaction.ts`                  | `opportunity.transaction.ts`                                       |
| Test mocks         | any `__tests__/`                            | `mocks.ts`                                 | `mocks.ts`                                                         |

**Rules**

- File base names are **kebab-case**; suffixes (`.use-case`, `.handler`,
  `.repository`, `.mapper`, `.transaction`, `.test`) are dot-separated.
- **Outbound adapter files always start with the technology prefix**
  (`drizzle-`, `redis-`, `ar-`) matching the folder they live in.
- Import paths must use the `.js` extension (ESM), even for `.ts` sources.

---

## 4. Function / exported-symbol naming per layer

The exported symbol is the **PascalCase of the file's `actor-verb-object`**,
wrapped by a layer-specific fixed affix. Symbol and file name must always encode
the same `actor-verb-object` triple.

| Layer            | Symbol pattern                                | Example (file → symbol)                                                          |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Use case factory | `make<ActorVerbObject>UseCase`                | `admin-suspend-opportunity` → `makeAdminSuspendOpportunityUseCase`               |
| Use case type    | `<ActorVerbObject>UseCase`                    | → `AdminSuspendOpportunityUseCase`                                               |
| Use case input   | `<ActorVerbObject>Input` (+ `...InputSchema`) | → `AdminSuspendOpportunityInput`, `AdminSuspendOpportunityInputSchema`           |
| Inbound handler  | `mount<ActorVerbObject>Handler`               | `admin-suspend-opportunity` → `mountAdminSuspendOpportunityHandler`              |
| Outbound adapter | `create<Technology><Object>Repository`        | `drizzle-opportunity.repository` → `createDrizzleOpportunityRepository`          |
| Row mapper fn    | `map<Object><Variant>Row`                     | `opportunity-row.mapper` → `mapOpportunityDetailRow`, `mapOpportunitySummaryRow` |
| Transaction fn   | `create<Object>InTransaction`                 | `opportunity.transaction` → `createOpportunityInTransaction`                     |

**Rules**

- Use cases with dependencies use the **factory** form `make…UseCase(deps)`;
  dependency-free use cases may be a plain `const … : UseCase = …`.
- Outbound adapter factories use the **`create<Technology>…`** prefix; use-case
  factories use **`make…`**. Do not mix the two.
- Handlers export a single `mount…Handler(fastify, useCase)` and are re-exported
  from `adapters/inbound/fastify/index.ts`. The re-exported symbol name must
  match the file's `actor-verb-object`.
- Handler-local constants (HTTP schema, validator, formatter) use the
  camelCase form of the same base name:
  `<actorVerbObject>HttpSchema`, `<actorVerbObject>Validator`,
  `<actorVerbObject>Formatter`.

---

## 5. Outbound port (interface) & method naming

Ports live in the **domain** layer and are named after the **object**, not the
actor (the actor is the calling use case, not the port).

- **File:** `<object>.repository.ts`.
- **Interface:** `<Object>Repository` (PascalCase, no `I` prefix) —
  e.g. `OpportunityRepository`, `PlaceRepository`, `SessionRepository`.
- **Methods:** camelCase, **`verb`-first** (`verb[Object][ByQualifier]`), because
  the actor is implicit at the call site. Persistence verbs are the CRUD/query
  set, not the business verbs:
  - `create`, `findById`, `findByIdAndOperatorId`, `findAll`,
    `updateStatusById`, `deleteByIdAndOperatorId`, `suspendById`,
    `suspendByIdAndOperatorId`, `cancelScheduledSuspensionById`,
    `countByExternalOperatorIds`.
  - Scope qualifiers use `By<Field>` and are chained with `And`
    (`…ByIdAndOperatorId`).
- **Method input types:** `<Verb><Object>Input` or `<Verb>By<Qualifier>Input`
  (PascalCase interfaces) — e.g. `CreateOpportunityInput`, `FindByIdInput`,
  `SuspendByIdAndOperatorIdInput`, `DeleteOpportunityByIdAndOperatorIdInput`.
- All methods return `Promise<Result<T, BaseError>>` (`neverthrow`).

---

## 6. Domain entity & value-object naming

- **File:** `<object>.ts`, **singular**, kebab-case
  (`opportunity.ts`, `operator.ts`, `opportunity-category.ts`, `user-type.ts`).
- **Zod schema:** `<Name>Schema` (PascalCase) — `OpportunitySchema`,
  `OperatorSchema`, `BenefitSchema`. Discriminated-union variants:
  `Benefit<Variant>Schema` (`BenefitFreeSchema`, `BenefitDiscountSchema`).
- **Inferred type:** `<Name>` (PascalCase) via `z.infer` — `Opportunity`,
  `Operator`, `Benefit`.
- **Enum-like constant maps:** `SCREAMING_SNAKE_CASE` const object with
  `SCREAMING_SNAKE` keys and `snake_case` string values, declared `as const` —
  `OPPORTUNITY_STATUS`, `ACTOR_TYPE`.
- Entities have **no dependencies** beyond value-object/schema types (`zod`).

---

## 7. Input/Output schema naming inside use cases

- **Input schema (private const):** `<ActorVerbObject>InputSchema`
  (`AdminSuspendOpportunityInputSchema`).
- **Input type (exported):** `<ActorVerbObject>Input`
  (`AdminSuspendOpportunityInput`), derived with `z.infer`/`z.input`.
- **Nested field schemas:** `<Field>InputSchema` (`BenefitInputSchema`,
  `LocalizedMetadataInputSchema`, `LocalizedMetadataListInputSchema`).
- Validate with the shared `validateUseCaseInput(<Schema>, input)` helper.

---

## 8. Quick checklist for a new operation

For a new business operation `operator publishes an opportunity`:

1. **Folder:** `opportunities/` (existing domain folder).
2. **Use case file:** `operator-publish-opportunity.use-case.ts`.
3. **Use case symbols:** `OperatorPublishOpportunityInputSchema`,
   `OperatorPublishOpportunityInput`, `OperatorPublishOpportunityUseCase`,
   `makeOperatorPublishOpportunityUseCase`.
4. **Handler file:** `operator-publish-opportunity.handler.ts` →
   `mountOperatorPublishOpportunityHandler`, re-exported from
   `adapters/inbound/fastify/index.ts`.
5. **Port (if new persistence needed):** method on `OpportunityRepository`
   named `verb…By…` (e.g. `updateStatusByIdAndOperatorId`) with a
   `<Verb>…Input` type.
6. **Outbound adapter:** implement in `drizzle-opportunity.repository.ts` inside
   `createDrizzleOpportunityRepository`.
7. **Test:** `__tests__/operator-publish-opportunity.use-case.test.ts` mocking
   the port via `createMock…Repository()` in `mocks.ts`.

---

## 9. Accepted deviations

Deviations listed here are **deliberate** and must not be reported as errors.
Anything not listed is a violation of §1–§8.

| Deviation                                                                                                            | Rationale                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Domain folders mix singular and plural: `opportunities/`, `places/` (plural) vs `profile/`, `department/` (singular) | Renaming them churns every layer for no functional gain. Each domain keeps its form **consistently** (§2).   |
| OpenAPI `operationId`s do not always match the use-case `actor-verb-object` base name (e.g. `approveOpportunity`)    | `operationId`s drive the orval-generated frontend clients; renaming them is a breaking change for consumers. |
| Generated code under `adapters/inbound/fastify/contracts/**`                                                         | Produced by orval from the OpenAPI spec. Never hand-edited, so it is out of scope for these conventions.     |

---
