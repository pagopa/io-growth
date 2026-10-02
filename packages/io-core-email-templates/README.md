# @pagopa/io-core-email-templates

HTML email templates used by `ced-portal-be`, authored in [MJML](https://mjml.io/) and
compiled into SESv2-compliant template JSON files.

This package only **generates typed, parameterized template content** — it
does not send email, resolve placeholders, or know about any email provider.
The generated `<name>.json` files are committed to the repo and can be fed
directly to the AWS SES `CreateEmailTemplate` API (or copied wherever
needed), which resolves `{{variableName}}` placeholders from the
caller-supplied `TemplateData` at send time.

## How it works

Each template lives in its own folder directly under `src/` (alongside the
shared `style.css`, `partials/`, and `assets/` folders):

```
src/opportunity-approved/
├── index.mjml                    # MJML source for the Html part (edit this)
├── meta.json                     # Subject / Text parts, as `{{placeholder}}` strings (edit this)
└── opportunity-approved.json     # Generated — commit this, do not hand-edit
```

Running `pnpm --filter=@pagopa/io-core-email-templates generate`:

1. Compiles `index.mjml` to HTML via `mjml2html` (shared `../style.css` and
   `../partials/*.mjml` are resolved relative to the template folder).
2. Rewrites local `../assets/` image paths to this repo's
   `raw.githubusercontent.com` URL (email clients can't resolve relative/local
   paths — see "Image hosting" below).
3. Collapses the compiled Html to a single line (no newlines or redundant
   whitespace) and swaps double-quoted attributes for single-quoted ones, so
   it embeds in the JSON file without any escaping.
4. Reads `meta.json` for the `subject` and `text` parts.
5. Writes `<name>/<name>.json` shaped like:
   ```json
   {
     "TemplateContent": { "Html": "...", "Subject": "...", "Text": "..." },
     "TemplateName": "opportunity-approved"
   }
   ```

`{{variableName}}` placeholders (e.g. `{{opportunityName}}`) are left
**unresolved** in all three parts — this package never substitutes values.

## Add a new template

1. Create `src/<name>/index.mjml`. Reuse `../style.css` and
   `../partials/*.mjml` via `<mj-include>` for shared layout/branding.
2. Create `src/<name>/meta.json` with `subject` and `text` string fields,
   using the same `{{placeholder}}` names referenced in the MJML markup.
3. Run `pnpm generate` (or `pnpm build`, which runs it first) to produce
   `src/<name>/<name>.json`, and commit it.

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

| Script                | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `generate`            | Compile all `.mjml`/`meta.json` sources into `<name>.json` files |
| `build`               | `generate` + `tsc` (produces `dist/`)                            |
| `typecheck`           | `tsc --noEmit`                                                   |
| `lint` / `lint:check` | ESLint                                                           |
