---
name: naming-convention-review
description: "Review backend naming conventions (actor-verb-object) against docs/naming-conventions.md and produce a read-only report of errors and warnings with file references. Use when the user asks to review, audit, check, or lint naming conventions of a backend app (apps/*-be) such as ced-portal-be, ced-card-request-be, or ced-browser-be. The review NEVER edits code — it only reports violations, their locations, and the expected name per the convention."
argument-hint: "The single backend app to review, e.g. ced-portal-be"
---

# Backend Naming Convention Review

Audit a **single** backend application against the `actor-verb-object` naming
rules defined in [docs/naming-conventions.md](../../../docs/naming-conventions.md)
and emit a **report only**. This skill is strictly **read-only**: it must never
create, rename, move, or edit any file. Its sole output is a Markdown report of
errors, warnings, and references to the offending files/symbols.

## When to Use

- "Review the naming conventions of `ced-portal-be`"
- "Audit naming in `ced-card-request-be`"
- "Check `apps/ced-browser-be` for naming-convention violations"
- Any request to lint/verify/report on `actor-verb-object` naming for a backend app.

## Hard Constraints

1. **Read-only.** Do not use edit/create/rename tools. Do not run auto-fixers,
   `--fix`, `mv`, or `git` mutations. If the user asks for fixes, produce the
   report first and explicitly ask for confirmation before touching code (that
   would be a separate task outside this skill).
2. **Single-app scope.** Review only the app the user named. Never scan or
   report on sibling apps or `packages/`. If the target is ambiguous or missing,
   ask which app before scanning.
3. **Source of truth.** `docs/naming-conventions.md` is authoritative. Always
   read it at the start so the review reflects the latest rules and the known
   deviations it records.

## Procedure

### 1. Resolve the target app

- Take the app from the invocation argument (e.g. `ced-portal-be`).
- Accept either a bare name (`ced-portal-be`) or a path (`apps/ced-portal-be`).
- Validate it exists and matches `apps/*-be`. Available backend apps can be
  found with a file search for `apps/*-be/package.json`.
- If none was given or it does not exist, list the available `apps/*-be` and ask
  the user to pick exactly one. Do **not** default to reviewing everything.

### 2. Load the rules

- Read [docs/naming-conventions.md](../../../docs/naming-conventions.md) in full.
- Treat §1–§7 as the checkable rules and §9 as the catalog of _known_
  deviations. Still report known deviations, but tag them `(known)` so the user
  can distinguish pre-existing debt from newly introduced issues.

### 3. Enumerate the app's artifacts (scoped to the target only)

Restrict every search to `apps/<target>/**`. Collect, per layer:

| Layer              | Location                                   | File pattern                               |
| ------------------ | ------------------------------------------ | ------------------------------------------ |
| Domain entity      | `src/domain/entities/`                     | `<object>.ts`                              |
| Outbound port      | `src/domain/ports/outbound/[persistence/]` | `<object>.repository.ts`                   |
| Use case           | `src/application/use-cases/<domain>/`      | `<actor>-<verb>-<object>.use-case.ts`      |
| Use-case test      | `.../__tests__/`                           | `<actor>-<verb>-<object>.use-case.test.ts` |
| Inbound handler    | `src/adapters/inbound/fastify/<domain>/`   | `<actor>-<verb>-<object>.handler.ts`       |
| Outbound adapter   | `src/adapters/outbound/<technology>/`      | `<technology>-<object>.repository.ts`      |
| Row mapper         | `src/adapters/outbound/<technology>/`      | `<object>-row.mapper.ts`                   |
| Transaction helper | `src/adapters/outbound/<technology>/`      | `<object>.transaction.ts`                  |
| Inbound barrel     | `src/adapters/inbound/fastify/index.ts`    | re-exported `mount*` symbols               |

For each file, also open it to read the **exported symbols** so file names and
symbol names can be cross-checked (they must encode the same base name).

### 4. Apply the checks

Run the checklist in [references/checklist.md](./references/checklist.md). Each
item states the rule, its severity, and the expected form. Key checks:

- **File base names** follow `actor-verb-object` / `verb-object`, kebab-case,
  correct layer suffix (`.use-case`, `.handler`, `.repository`, `.mapper`,
  `.transaction`, `.test`).
- **Actor-first ordering** — flag `verb-actor-object` (e.g.
  `create-operator-opportunity`) as an error; expected `operator-create-opportunity`.
- **File ↔ symbol agreement** — the exported `make…UseCase` / `…UseCase` /
  `mount…Handler` / `create<Tech>…Repository` must PascalCase the _same_ base
  name as the file. A `mount…Handler` missing the actor, or a use case adding a
  verb the file lacks, is an error.
- **Singular vs plural object** — singular for single-item ops, plural for
  `list`/collection ops.
- **Technology prefix** on outbound adapters (`drizzle-`, `redis-`, `ar-`).
- **Ports**: interface `<Object>Repository` (no `I` prefix), `verb`-first
  camelCase methods with `By<Field>`/`And` qualifiers.
- **Entities/value objects**: singular kebab file, `PascalCaseSchema`,
  `SCREAMING_SNAKE_CASE` const maps.
- **Folder naming**: kebab-case domain folders; flag singular/plural
  inconsistency across `use-cases/` vs `inbound/fastify/` for the same domain.

Classify each finding:

- **ERROR** — a concrete rule violation (wrong order, file/symbol mismatch,
  wrong casing, missing tech prefix, `I` prefix, wrong suffix/affix).
- **WARNING** — consistency/style issues (singular↔plural domain folders,
  ambiguous actor omission on a role-specific op, borderline object plurality).

### 5. Emit the report

Produce a single Markdown report using
[references/report-template.md](./references/report-template.md). Requirements:

- Reference every finding to a real file with a workspace-relative link and,
  when a symbol is involved, its line (`path.ts#L42`).
- For each finding include: severity, rule section (`§n`), the observed name,
  and the **expected** name.
- Tag findings that match §9 with `(known)`.
- End with a summary count (errors, warnings, files reviewed) and note that **no
  files were modified**.

Do not apply any change. Stop after presenting the report.
