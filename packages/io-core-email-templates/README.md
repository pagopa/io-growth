# @pagopa/io-core-email-templates

HTML email templates used by `ced-portal-be`, authored in [MJML](https://mjml.io/) and
compiled to plain TypeScript modules at build time.

This package only **generates typed template content** — it does not send email
or know about any email provider (OneMail, Mailjet, etc.). Consumers import the
generated `apply*Template` functions and pass the resulting HTML string to
whatever `EmailRepository` outbound adapter they use.

## How it works

Each template lives in its own folder directly under `src/` (alongside the
shared `style.css`, `partials/`, and `assets/` folders):

```
src/opportunity-approved/
├── index.mjml              # MJML source (edit this)
├── applier.template.ts     # Typed `apply(input)` function, contains `{{TEMPLATE}}`
├── index.ts                # Generated — do not edit, do not commit
└── __tests__/
    └── index.test.ts
```

Running `pnpm --filter=@pagopa/io-core-email-templates generate`:

1. Compiles `index.mjml` to HTML via `mjml2html` (shared `../style.css` and
   `../partials/*.mjml` are resolved relative to the template folder).
2. Rewrites local `../assets/` image paths to this repo's
   `raw.githubusercontent.com` URL (email clients can't resolve relative/local
   paths — see "Image hosting" below).
3. Reads `applier.template.ts` and replaces the `{{TEMPLATE}}` placeholder
   with the compiled HTML.
4. Writes the result to `index.ts` in the same folder (gitignored — it is
   regenerated on every `build`/`test` via the turbo `generate` task).

The `apply(input)` function in `applier.template.ts` resolves any remaining
`{{variableName}}` placeholders left in the MJML markup (e.g.
`{{opportunityName}}`) using its typed parameters, so the function returns a
fully-resolved HTML string with no leftover placeholders.

## Add a new template

1. Create `src/<name>/index.mjml`. Reuse `../style.css` and
   `../partials/*.mjml` via `<mj-include>` for shared layout/branding.
2. Create `src/<name>/applier.template.ts` exporting:
   - A typed input interface for the template's parameters.
   - An `apply(input)` function returning `` `{{TEMPLATE}}` `` with any
     placeholders in the markup replaced using the input.
3. Run `pnpm generate` (or `pnpm build`, which runs it first) to produce
   `index.ts`.
4. Add a snapshot test under `src/<name>/__tests__/index.test.ts`.
5. Export the `apply` function from `src/index.ts`.

## Image hosting

`<mj-image>` tags (e.g. in `partials/pagopa-logo.mjml`) reference assets via a
local relative path (`../assets/logo_pagopa.png`) so they work with any MJML
tooling/preview. Since email clients can't resolve relative/local paths, the
`generate` script rewrites `../assets/` to
`https://raw.githubusercontent.com/pagopa/io-growth/main/packages/io-core-email-templates/src/assets/`
in the compiled output, so generated templates always ship with a public URL.
If an asset is renamed/added, make sure it's committed — the URL only resolves
once the file exists on `main`.

## Scripts

| Script                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `generate`            | Compile all `.mjml` templates into `index.ts` files |
| `build`               | `generate` + `tsc` (produces `dist/`)               |
| `test`                | Run Vitest snapshot tests                           |
| `typecheck`           | `tsc --noEmit`                                      |
| `lint` / `lint:check` | ESLint                                              |
