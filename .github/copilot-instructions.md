# io-growth Monorepo

## Overview

pnpm monorepo managed with Turborepo. All commands run from the **workspace root** using pnpm.

### Workspace Structure

- `apps/ced-portal-be` — Backend (Fastify, hexagonal architecture, Drizzle ORM, Redis)
- `apps/ced-portal-fe` — Frontend (React 18, MUI, Redux Toolkit + RTK Query)
- `packages/io-core-domain` — Shared domain types, errors, value objects, and inbound port interfaces
- `packages/io-core-adapter-*` — Technology adapters (fastify, drizzle, redis)

## Commands

All commands run from root. **Never** `cd` into a package/app to run scripts.

```sh
# Lint (all workspaces)
pnpm lint

# Lint with auto-fix (after refactoring or code changes)
pnpm lint -- --fix

# Build all
pnpm build

# Typecheck all
pnpm typecheck

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Full code review pipeline (format + lint + coverage)
pnpm code-review

# Run a single workspace task
pnpm --filter=ced-portal-be run:dev
pnpm --filter=ced-portal-be test
pnpm --filter=ced-portal-fe dev

# Database migrations (backend)
pnpm --filter=ced-portal-be migrate:dev

# Versioning (changesets)
pnpm version
pnpm release
```

## Technology Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| Runtime            | Node.js 22, ESM (`"type": "module"`)     |
| Package manager    | pnpm 10 with catalog dependencies        |
| Build orchestrator | Turborepo                                |
| Backend framework  | Fastify 5                                |
| ORM                | Drizzle ORM (PostgreSQL)                 |
| Cache/sessions     | Redis                                    |
| Frontend framework | React 18                                 |
| UI library         | MUI 5 + `@pagopa/mui-italia`             |
| State management   | Redux Toolkit + RTK Query                |
| Routing            | React Router v6                          |
| Validation         | Zod (backend), Standard Schema           |
| Error handling     | `neverthrow` (`Result<T, E>` everywhere) |
| Testing            | Vitest                                   |
| Linting            | `@pagopa/eslint-config`                  |

## Code Conventions

### Error Handling

Use `neverthrow` `Result` types — **never throw exceptions** for business logic errors. All use cases and port methods return `Promise<Result<T, BaseError>>`. Error classes extend `BaseError` from `@pagopa/io-core-domain/errors`.

Available error types: `ValidationError`, `NotFoundError`, `ConflictError`, `ForbiddenError`, `GenericError`.

### Imports

- Use `.js` extensions in all TypeScript import paths (ESM resolution)
- Use `type` imports for type-only imports: `import type { Foo } from "..."`
- Workspace packages are imported as `@pagopa/io-core-domain`, `@pagopa/io-core-adapter-redis`, etc.

### Testing

- Test files live alongside source in `__tests__/` directories
- Test file naming: `<module>.test.ts`
- Use `vitest` with `vi.fn()` for mocks
- Mock port interfaces (e.g., `SessionStore`, `OperatorStore`) — never mock adapter internals
- Frontend tests use `@testing-library/react`

### Dependencies

Shared dependency versions are managed via [pnpm catalog](pnpm-workspace.yaml). When adding a dependency that already exists in the catalog, use `catalog:` as the version specifier.

### Git

Use changesets for versioning. After making changes, run `pnpm changeset` and follow the prompts.
