# Naming Convention Check List

Detailed, per-layer checks derived from `docs/naming-conventions.md`. For each
finding, record: **severity**, **rule §**, **file (link + line if symbol)**, the
**observed** name, and the **expected** name. Tag `(known)` when the item also
appears in §9 of the source doc.

Legend: 🔴 ERROR · 🟡 WARNING

---

## A. Folder naming (§2)

- 🔴 Domain/structural folders must be kebab-case, lowercase.
- 🔴 Structural folders must not be renamed: `domain/`, `domain/entities/`,
  `domain/ports/outbound/`, `domain/ports/outbound/persistence/`,
  `application/use-cases/`, `adapters/inbound/fastify/`,
  `adapters/outbound/<technology>/`, `contracts/`, `schema/`, `__tests__/`.
- 🟡 A domain folder should use the **same** name (and same singular/plural
  choice) under `application/use-cases/` and `adapters/inbound/fastify/`.
- 🟡 Mixed singular/plural domain folders across the app (e.g. `opportunities/`
  - `places/` plural but `profile/` + `department/` singular) → flag as a
    consistency warning `(known)`.

## B. File naming per layer (§3)

Base name must be `actor-verb-object` (or `verb-object` for actor-less
technical ops), kebab-case, with the correct dot-suffix.

- 🔴 **Actor-first ordering.** `verb-actor-object` is wrong.
  - e.g. `create-operator-opportunity.use-case.ts` → expected
    `operator-create-opportunity.use-case.ts`. `(known)`
- 🔴 Wrong/missing layer suffix (`.use-case`, `.handler`, `.repository`,
  `.mapper`, `.transaction`, `.test`).
- 🔴 Outbound adapter file missing its **technology prefix**.
  - e.g. `health-check.repository.ts` under `drizzle/` → expected
    `drizzle-health-check.repository.ts`. `(known)`
- 🔴 Object plurality mismatch:
  - single-item op uses plural, or `list`/collection op uses singular.
  - expected: `admin-get-opportunity` (singular), `admin-list-opportunities`
    (plural).
- 🟡 Actor omitted on a role-specific business op (actor may be omitted **only**
  for technical/infra ops like `health`/`auth`: `info-readiness`, `acs`,
  `authorize`).
- 🔴 Non-kebab base name (camelCase/PascalCase/snake_case in file base).

## C. Function / exported-symbol naming (§4)

The exported symbol is the PascalCase of the file's base name, wrapped by the
layer affix. **File and symbol must encode the same `actor-verb-object`.**

| Layer            | Expected symbol                                           |
| ---------------- | --------------------------------------------------------- |
| Use case factory | `make<ActorVerbObject>UseCase`                            |
| Use case type    | `<ActorVerbObject>UseCase`                                |
| Use case input   | `<ActorVerbObject>Input` / `<ActorVerbObject>InputSchema` |
| Inbound handler  | `mount<ActorVerbObject>Handler`                           |
| Outbound adapter | `create<Technology><Object>Repository`                    |
| Row mapper fn    | `map<Object><Variant>Row`                                 |
| Transaction fn   | `create<Object>InTransaction`                             |

- 🔴 Symbol drops or adds an actor/verb relative to the file name.
  - `admin-approve-opportunity.handler.ts` exporting
    `mountApproveOpportunityHandler` → expected
    `mountAdminApproveOpportunityHandler`. `(known)`
  - `admin-get-opportunity.handler.ts` exporting `mountGetOpportunityHandler`
    → expected `mountAdminGetOpportunityHandler`. `(known)`
  - `info-readiness.use-case.ts` exporting `makeGetInfoReadinessUseCase` →
    file/symbol base names must match. `(known)`
- 🔴 Use-case factory not using `make…UseCase`; outbound factory not using
  `create<Technology>…Repository` (do not mix the two prefixes).
- 🔴 Handler not re-exported from `adapters/inbound/fastify/index.ts`, or the
  re-exported name not matching the file's base name.

## D. Outbound ports / interfaces & methods (§5)

- 🔴 Port file must be `<object>.repository.ts` and interface `<Object>Repository`
  (PascalCase, **no `I` prefix**).
  - `IHealthCheckRepository` → expected `HealthCheckRepository`. `(known)`
- 🔴 Ports named after the actor instead of the object.
- 🔴 Methods must be camelCase, **verb-first** (`verb[Object][ByQualifier]`),
  using CRUD/query verbs (`create`, `findById`, `findAll`, `updateStatusById`,
  `deleteByIdAndOperatorId`, `suspendById`, …). Scope qualifiers use `By<Field>`
  chained with `And` (`…ByIdAndOperatorId`).
- 🔴 Method input types not `<Verb><Object>Input` / `<Verb>By<Qualifier>Input`.
- 🟡 Methods returning something other than `Promise<Result<T, BaseError>>`.

## E. Domain entities & value objects (§6)

- 🔴 Entity file not singular kebab-case `<object>.ts`.
- 🔴 Zod schema not `<Name>Schema` (PascalCase); discriminated variants
  `<Name><Variant>Schema`.
  - `localizedMetadataSchema` (camelCase) → expected `LocalizedMetadataSchema`.
    `(known)`
- 🔴 Inferred type not PascalCase `<Name>` via `z.infer`.
- 🔴 Enum-like const maps not `SCREAMING_SNAKE_CASE` (keys `SCREAMING_SNAKE`,
  values `snake_case`, `as const`).

## F. Use-case input/output schemas (§7)

- 🔴 Input schema const not `<ActorVerbObject>InputSchema`.
- 🔴 Exported input type not `<ActorVerbObject>Input`.
- 🔴 Nested field schemas not `<Field>InputSchema`.
- 🟡 Input not validated via the shared `validateUseCaseInput(<Schema>, input)`
  helper.

---

## Severity quick rule

- Concrete, unambiguous rule break → **🔴 ERROR**.
- Consistency/style/ambiguity → **🟡 WARNING**.
- Anything already listed in §9 of `docs/naming-conventions.md` → keep the
  severity above and append `(known)`.
