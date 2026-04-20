# @pagopa/io-core-adapter-fastify

Fastify adapter helpers for exposing `@pagopa/io-core-domain` use cases over HTTP.

## Overview

This package provides reusable helpers for mapping domain errors to RFC 7807 problem details, validating HTTP payloads, and building Fastify handlers around core use cases.

## Structure

```
src/
├── errorMapper.ts
├── httpHandlerBuilder.ts
├── validator/
└── index.ts
```

## Usage

```ts
import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm build`         | Compile TypeScript to `dist/`  |
| `pnpm typecheck`     | Type-check without emitting    |
| `pnpm lint:check`    | Run ESLint                     |
| `pnpm test`          | Run tests with Vitest          |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm clean`         | Remove `dist/`                 |
