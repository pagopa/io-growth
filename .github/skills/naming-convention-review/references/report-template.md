# Report Template

Fill and present this Markdown report. Keep every finding tied to a real file
link. Do **not** modify any file.

---

# Naming Convention Review — `<app>`

- **Scope:** `apps/<app>/`
- **Source of truth:** `docs/naming-conventions.md`
- **Mode:** read-only (no files were modified)

## Summary

| Metric                | Count |
| --------------------- | ----- |
| 🔴 Errors             | `<n>` |
| 🟡 Warnings           | `<m>` |
| Files reviewed        | `<x>` |
| Known deviations (§9) | `<k>` |

> One-line verdict, e.g. "3 new errors, 5 known deviations. Layer folders are
> consistent except the profile/department singular↔plural split."

## 🔴 Errors

### [E1] `<short title>` — §`<n>` `(known?)`

- **File:** [apps/&lt;app&gt;/src/.../file.ts](apps/<app>/src/.../file.ts#L42)
- **Observed:** `<observed name / symbol>`
- **Expected:** `<expected name / symbol>`
- **Why:** short reference to the rule.

_(repeat E2, E3, …)_

## 🟡 Warnings

### [W1] `<short title>` — §`<n>` `(known?)`

- **File:** [apps/&lt;app&gt;/src/.../file.ts](apps/<app>/src/.../file.ts)
- **Observed:** `<observed>`
- **Expected / suggestion:** `<expected>`
- **Why:** short reference to the rule.

_(repeat W2, W3, …)_

## Clean layers

List layers/folders that passed with no findings, so the user knows what was
checked, e.g.:

- ✅ Outbound ports (`domain/ports/outbound/`) — all `<Object>Repository`, no `I` prefix.
- ✅ Row mappers — all `map<Object><Variant>Row`.

## Notes

- Findings tagged `(known)` already appear in §9 of `docs/naming-conventions.md`
  (pre-existing debt), separated here from newly introduced issues.
- No changes were applied. To fix any item, start a separate task and confirm
  the rename scope first (renames touch file names **and** exported symbols and
  their import sites).
