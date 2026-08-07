# CED Card Request — BFF support data model (CosmosDB)

This document proposes the persistence model the `ced-card-request-be` BFF uses to
stay **reconcilable** with the INPS source of truth while solving the idempotency
concerns of a multi-step submission flow.

## Source of truth

INPS owns the real application state. The BFF persistence is only a **support
record** to:

1. resolve the `idLavorazione` from the session `codiceFiscale`;
2. drive per-step **idempotency** (safe retry vs. intentional re-submission);
3. detect in-flight operations and **reconcile** them against `CheckDomanda`.

`CheckDomanda.esitoCheck` is always authoritative for the milestone state.

## The idempotency problem

INPS idempotency is **per method invocation**, keyed by the `Idempotency-Key`
header:

| Method                | Same key               | Different key                                        |
| --------------------- | ---------------------- | ---------------------------------------------------- |
| `NuovaDomandaInBozza` | safe replay, no change | **cancels** the draft, creates a new `idLavorazione` |
| `FornisciFoto`        | safe replay, no change | **overwrites** the photo                             |
| `ConfermaDomanda`     | safe replay, no change | `400/115` once acquired                              |

A single `idempotencyKey` per citizen cannot express this: we need **one key per
step**, plus a way to tell a _retry_ (reuse the key) from a _new intent_ (rotate
the key). We also need a rule that an earlier step changing **cascades** an
invalidation onto later steps (a new draft ⇒ the old photo no longer belongs to
the new `idLavorazione`).

## Container

- Container: `ced-applications`
- Partition key: `/partitionKey` = `codiceFiscale`
- Document `id` = `codiceFiscale` (one support record per citizen)
- TTL enabled (e.g. 30 days) so abandoned drafts self-clean; refreshed on write
- Optimistic concurrency via `_etag` (all updates use `If-Match`)

## Document shape

```jsonc
{
  "id": "RSSMRA80A01H501U",
  "partitionKey": "RSSMRA80A01H501U",
  "schemaVersion": 2,

  // INPS identifiers / authoritative milestone
  "idLavorazione": "ABC-12345", // null until NuovaDomandaInBozza succeeds
  "previousIdLavorazione": null, // set on esitoCheck=50 to show history via /details
  "state": "READY_FOR_PHOTO_UPLOAD", // milestone state (reconcilable with INPS)
  "pendingStep": "PHOTO", // null | DRAFT | PHOTO | CONFIRM (in-flight write)

  // Per-step idempotency bookkeeping
  "steps": {
    "draft": {
      "clientRequestId": "5e0b...a1", // Idempotency-Key sent by the FE (user intent)
      "inpsIdempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
      "status": "COMPLETED", // PENDING | COMPLETED | FAILED
      "attempts": 1,
      "lastErrorCode": null,
      "submittedAt": "2026-04-30T10:00:00.000Z",
      "completedAt": "2026-04-30T10:00:02.000Z",
    },
    "photo": {
      "clientRequestId": "9b1c...f7",
      "inpsIdempotencyKey": "660e8400-e29b-41d4-a716-446655440001",
      "status": "PENDING",
      "attempts": 1,
      "lastErrorCode": null,
      "submittedAt": "2026-04-30T10:05:00.000Z",
      "completedAt": null,
    },
    "confirm": null,
  },

  // Last reconciliation snapshot (diagnostics / debounce)
  "lastReconciliation": { "esitoCheck": 20, "at": "2026-04-30T10:04:00.000Z" },

  "createdAt": "2026-04-30T10:00:00.000Z",
  "updatedAt": "2026-04-30T10:05:00.000Z",
  "ttl": 2592000,
  "_etag": "\"00000000-0000-0000-0000-000000000000\"",
}
```

### `state` (milestone) vs `pendingStep` (in-flight)

`state` only holds **milestones that INPS can confirm** and maps 1:1 to
`esitoCheck`, so it is always reconcilable:

| `esitoCheck` | `state`                                           |
| ------------ | ------------------------------------------------- |
| 10           | `READY_FOR_NEW_DRAFT`                             |
| 20           | `READY_FOR_PHOTO_UPLOAD`                          |
| 30           | `READY_FOR_DOCUMENTS_UPLOAD`                      |
| 40           | `ACQUIRED`                                        |
| 50           | `READY_FOR_NEW_DRAFT` (+ `previousIdLavorazione`) |

`pendingStep` carries the local-only "uploading" information. The exposed API
`ApplicationState` is **derived**: `UPLOADING_PHOTO` = `state=READY_FOR_PHOTO_UPLOAD`

- `pendingStep=PHOTO`, etc. Keeping the in-flight flag out of the milestone field is
  what makes reconciliation deterministic.

## Write algorithm (per step `S` ∈ {draft, photo, confirm})

Input: session `codiceFiscale`, `Idempotency-Key` header = `clientKey`, payload.

1. Read record `R` (`partitionKey = codiceFiscale`).
2. **Replay / retry detection** — if `R.steps[S]` exists and
   `R.steps[S].clientRequestId == clientKey`:
   - `COMPLETED` → return the cached success, **no INPS call** (true replay).
   - `PENDING` or `FAILED` → reuse `R.steps[S].inpsIdempotencyKey` and re-call INPS
     (INPS replays safely on the same key).
3. **New intent** — otherwise generate a fresh `inpsIdempotencyKey` (UUID) and apply
   the **cascade rule**:
   - `draft`: reset `photo` and `confirm` to `null`, clear `idLavorazione`
     (the new draft will return a new one).
   - `photo`: reset `confirm` to `null` (the prior photo is replaced).
   - `confirm`: no downstream step.
4. **Write 1** (intent record): set `R.steps[S] = { clientRequestId: clientKey,
inpsIdempotencyKey, status: PENDING, attempts: 1, submittedAt: now }`,
   `pendingStep = S`. Persist with `If-Match`.
5. Call INPS with `Idempotency-Key: inpsIdempotencyKey`.
6. **Write 2** (outcome):
   - INPS `200` → set `idLavorazione` (if returned), `steps[S].status = COMPLETED`,
     advance milestone `state`, `pendingStep = null`, and clear
     `lastReconciliation` because the previous snapshot predates this successful
     authoritative write.
   - INPS `400` → `steps[S].status = FAILED`, store `lastErrorCode`,
     `pendingStep = null`, `state` unchanged → surface the INPS error to the FE.
   - INPS `5xx`/timeout → **leave** `status = PENDING` (so the next call reuses the
     same key) → return `500/503`.

This gives exactly the desired semantics: an automatic FE retry (same `clientKey`)
is always safe; the user changing the photo (new `clientKey`) rotates the INPS key
and overwrites; the user editing the draft (new `clientKey` on `/request`) rotates
the draft key, lets INPS cancel + recreate, and cascades a reset of photo/confirm so
our record can never reference a stale `idLavorazione`.

## Reconciliation algorithm (on `GET /status` → `CheckDomanda`)

1. Read `R`; call `CheckDomanda(codiceFiscale)` → `esitoCheck`, `idLavorazione_INPS`.
2. Map `esitoCheck` → authoritative milestone (table above).
3. Align:
   - `esitoCheck` 10/50 and `R` has a draft → INPS has no active draft:
     clear `steps`, `idLavorazione = null`, `state = READY_FOR_NEW_DRAFT`
     (for 50 set `previousIdLavorazione = R.idLavorazione`).
   - `esitoCheck` 20/30/40 → `idLavorazione = idLavorazione_INPS`,
     `state =` mapped milestone.
     - If `pendingStep` matches and INPS already reflects its success
       (e.g. `pendingStep=PHOTO` and `esitoCheck=30`) → mark step `COMPLETED`,
       `pendingStep = null`.
     - If INPS does **not** reflect it yet (`pendingStep=PHOTO`, `esitoCheck=20`) →
       keep the step retryable (`status=PENDING/FAILED`, `pendingStep=null`) so the
       FE can re-issue with the same `clientKey`.
   - `R` missing but INPS has state → recreate `R` from `esitoCheck` (generate a
     reconcile `inpsIdempotencyKey` for the next writable step).
   - INPS business error (700, 212-214, 701/702) → no local mutation; surface error.
4. Persist `R` with `If-Match`; return derived `ApplicationState` to the FE.

## Invariants

- `idLavorazione` is mutated **only** by a successful `draft` step or by
  reconciliation against INPS — never invented locally.
- A change to step `S` cascades a reset to all steps after `S`.
- `pendingStep != null` ⇒ exactly one `steps[*].status == PENDING`.
- The milestone `state` never advances without an INPS `200` (or a reconciliation
  that observed the corresponding `esitoCheck`).
- `lastReconciliation` describes only the latest `CheckDomanda` observation and is
  cleared whenever a successful write advances the authoritative INPS milestone.
- All updates are `If-Match` guarded to avoid lost updates between the FE retry and
  background reconciliation.
