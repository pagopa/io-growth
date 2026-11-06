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
src/operator-opportunity-approved/
├── index.mjml                             # MJML source for the Html part (edit this)
├── meta.json                              # Subject / Text parts, as `{{placeholder}}` strings (edit this)
└── operator-opportunity-approved.json     # Generated — commit this, do not hand-edit
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
     "TemplateName": "operator-opportunity-approved"
   }
   ```

`{{variableName}}` placeholders (e.g. `{{opportunityName}}`) are left
**unresolved** in all three parts — this package never substitutes values.

## Add a new template

1. Create `src/<name>/index.mjml`. Reuse `../style.css` and
   `../partials/*.mjml` via `<mj-include>` for shared layout/branding.
2. Create `src/<name>/meta.json` with `subject` and `text` string fields,
   using the same `{{placeholder}}` names referenced in the MJML markup.
3. From the workspace root, run
   `pnpm --filter=@pagopa/io-core-email-templates generate` to produce
   `src/<name>/<name>.json`, and commit it.

## Opportunity notification scenarios

The backend uses provider IDs shaped as `ced_<template-name>_v1`. Keep existing
IDs stable and register the four new templates through the existing provider
publication process before deploying their notification producers. Generating
JSON does not register remote templates or change sender configuration.

| Template                                          | Trigger                                                     | Recipient  |
| ------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| `operator-opportunity-approved`                   | Department approves an opportunity                          | Operator   |
| `operator-opportunity-rejected`                   | Department requests changes                                 | Operator   |
| `operator-opportunity-published`                  | Publication notification job finds a visible opportunity    | Operator   |
| `operator-opportunity-republished`                | Department republishes a suspended opportunity              | Operator   |
| `operator-opportunity-deleted`                    | Operator deletes an opportunity                             | Operator   |
| `operator-opportunity-republish-rejected` (new)   | Department refuses a republication request                  | Operator   |
| `operator-opportunity-suspended` (new)            | Department applies or schedules suspension                  | Operator   |
| `operator-opportunity-suspension-cancelled` (new) | Department cancels a scheduled suspension                   | Operator   |
| `operator-opportunity-self-republished` (new)     | Operator republishes their self-suspended opportunity       | Operator   |
| `admin-new-opportunity`                           | Operator submits a draft for review                         | Department |
| `admin-revise-opportunity`                        | Operator resubmits after requested changes                  | Department |
| `admin-opportunity-suspended`                     | Operator applies or schedules suspension                    | Department |
| `admin-opportunity-deleted`                       | Operator deletes an eligible non-draft opportunity          | Department |
| `admin-opportunity-republish-request`             | Operator requests republication after department suspension | Department |
| `admin-opportunity-suspension-cancelled`          | Operator cancels their scheduled suspension                 | Department |
| `admin-opportunity-republished`                   | Operator republishes their self-suspended opportunity       | Department |

Operator self-republication queues two distinct messages: confirmation to the
operator and notification to the department. State transitions and notification
enqueueing share a database transaction.

Dates in email attributes use `dd/mm/yyyy`: publication uses the stored
availability date, suspension uses its effective date, and department cancellation
uses the schedule being cancelled. The revision email intentionally omits an
edit-by-edit description until a reliable change source is available.

Run `pnpm --filter=@pagopa/io-core-email-templates test` from the workspace root
after generation to check all 16 subjects, HTML/text copy, emphasis, links, and
scenario-specific omissions. Logo presentation is not part of those assertions.

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

| Script                | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| `generate`            | Compile all `.mjml`/`meta.json` sources into `<name>.json` files    |
| `build`               | Clean `dist/` + `tsc` (run `generate` separately for template JSON) |
| `typecheck`           | `tsc --noEmit`                                                      |
| `lint` / `lint:check` | ESLint                                                              |
