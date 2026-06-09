# @pagopa/io-core-adapter-azure-tracing

Cross-cutting tracing and telemetry adapter for the io-growth monorepo. It wraps
[`@pagopa/azure-tracing`](https://www.npmjs.com/package/@pagopa/azure-tracing)
(which itself wraps `@azure/monitor-opentelemetry`) behind a small, technology
agnostic port so apps and packages can emit telemetry to Azure Application
Insights without depending on the underlying SDK.

See the DX guide: https://dx.pagopa.it/docs/azure/monitoring/azure-tracing

## Architecture

The package follows the same hexagonal layout as the other service adapters:

```
src/
├── index.ts                                   # barrel exports
├── config.ts                                  # env schema + typed config builder
├── domain/
│   ├── entities.ts                            # CustomEvent / RequestTelemetry / ExceptionTelemetry
│   └── ports/outbound/
│       └── telemetry-client.port.ts           # TelemetryClient (the only contract callers depend on)
├── adapters/
│   ├── inbound/fastify/
│   │   └── tracing.plugin.ts                   # Fastify plugin (onResponse / onError)
│   └── outbound/azure-monitor/
│       └── azure-tracing.client.ts             # TelemetryClient backed by @pagopa/azure-tracing
└── application/
    ├── telemetry-registry.ts                   # initTelemetry + process-wide client singleton
    └── emit-custom-event.ts                    # emitCustomEvent facade
```

Only `azure-tracing.client.ts` imports `@pagopa/azure-tracing`. Replacing the
tracing backend means writing a new outbound adapter that implements
`TelemetryClient` — every app/package hook stays untouched.

## Usage

### 1. Initialize (as early as possible)

```ts
// telemetry.ts — imported FIRST in main.ts
import {
  azureTracingConfigSchema,
  buildAzureTracingConfig,
  initTelemetry,
} from "@pagopa/io-core-adapter-azure-tracing";

const env = azureTracingConfigSchema.parse(process.env);
initTelemetry(buildAzureTracingConfig(env, "my-service"));
```

For ESM apps deployed on Azure Container Apps the most robust alternative is the
preload `NODE_OPTIONS=--import @pagopa/azure-tracing`.

### 2. Auto-track every endpoint (Fastify)

```ts
import { tracingPlugin } from "@pagopa/io-core-adapter-azure-tracing";

const app = Fastify();
await app.register(tracingPlugin); // tracks duration, status code, exceptions
```

### 3. Emit custom events from business logic

```ts
import { emitCustomEvent } from "@pagopa/io-core-adapter-azure-tracing";

emitCustomEvent(eventName, { caller, data: JSON.stringify(data) })(caller);
```

## Configuration

| Env var                                     | Required | Default |
| ------------------------------------------- | -------- | ------- |
| `APPLICATIONINSIGHTS_CONNECTION_STRING`     | no\*     | —       |
| `APPINSIGHTS_SAMPLING_PERCENTAGE`           | no       | `5`     |
| `APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED` | no       | `false` |

\* When the connection string is absent, telemetry is disabled and the adapter
becomes a safe no-op (handy for local development and tests). With Entra ID auth
enabled, the managed identity must hold the **Monitoring Metrics Publisher**
role on the Application Insights resource.
