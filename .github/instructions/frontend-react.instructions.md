---
description: "Use when writing or reviewing frontend app code. Covers feature-sliced structure, RTK Query API injection, component patterns, and state management."
applyTo: "apps/ced-portal-fe/**"
---

# Frontend — React + RTK Query Conventions

## Directory Layout

```
src/
├── app/                          # App shell: routes, providers
│   ├── providers.tsx
│   ├── routes.tsx
│   └── routeConfig.ts
├── core/                         # Cross-cutting infrastructure
│   ├── api/baseApi.ts            # RTK Query base API (singleton)
│   ├── auth/                     # Auth slice, selectors, guards
│   ├── store/index.ts            # Redux store configuration
│   └── theme/                    # MUI theme
├── features/                     # Feature-sliced modules
│   └── <feature>/
│       ├── api.ts                # RTK Query endpoint injection
│       ├── hooks.ts              # Feature-specific hooks
│       └── types.ts              # Feature types/interfaces
├── components/                   # Shared UI components
├── contexts/                     # React contexts (e.g., Toast)
├── hooks/                        # Shared hooks (store, routing)
├── layouts/                      # Page layouts
├── pages/                        # Page components
├── constants/                    # App-wide constants
└── utils/                        # Utility functions
```

## Feature Modules (`features/`)

Each feature is a self-contained folder with:

- `api.ts` — Injects endpoints into the shared `baseApi` using `baseApi.injectEndpoints()`
- `hooks.ts` — Custom hooks that compose RTK Query hooks with app logic
- `types.ts` — TypeScript interfaces for the feature's data models

Features **never** import from other features. Shared logic goes in `core/`, `hooks/`, or `components/`.

```ts
// features/benefits/api.ts
export const benefitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBenefits: builder.query<BenefitsResponse, void>({
      query: () => "/benefits",
      providesTags: ["Benefits"],
    }),
  }),
});
export const { useGetBenefitsQuery } = benefitsApi;
```

## State Management

- **Redux Toolkit** for global state, **RTK Query** for server state
- All API endpoints inject into the single `baseApi` from `core/api/baseApi.ts`
- Each feature's slice is registered in `core/store/index.ts`
- Use `useAppDispatch` and `useAppSelector` typed hooks from `hooks/store`

## Component Patterns

- UI library: **MUI 5** with `@pagopa/mui-italia` theme extensions
- Use functional components with hooks
- Page components live in `pages/`, layouts in `layouts/`
- Route definitions in `app/routeConfig.ts`, wiring in `app/routes.tsx`

## Testing

- Use `vitest` with `@testing-library/react`
- Test component behavior, not implementation details
