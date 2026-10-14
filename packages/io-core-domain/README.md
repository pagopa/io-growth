# @pagopa/io-core-domain

Shared domain primitives for the IO platform ecosystem.

## Overview

This package provides reusable domain building blocks — errors, entities, and value objects — to be consumed within this monorepo and, eventually, published to npm.

## Structure

```
src/
├── errors/        # Domain error classes (BaseError, NotFoundError, …)
├── entities/      # Domain entities
├── value-objects/ # Value objects
└── index.ts       # Public barrel export
```

## Usage

```ts
import { NotFoundError, ValidationError } from "@pagopa/io-core-domain/errors";
```

Use `getApplicationDate` for date-only publication rules that follow Italy's calendar,
independently of the server timezone and including daylight-saving changes:

```ts
import { getApplicationDate } from "@pagopa/io-core-domain/utilities";

getApplicationDate(new Date("2026-07-14T22:00:00Z")); // "2026-07-15"
```

Without an argument, it formats the current instant as `YYYY-MM-DD`.

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm build`         | Compile TypeScript to `dist/`  |
| `pnpm typecheck`     | Type-check without emitting    |
| `pnpm lint:check`    | Run ESLint                     |
| `pnpm test`          | Run tests with Vitest          |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm clean`         | Remove `dist/`                 |
