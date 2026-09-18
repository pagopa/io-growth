import { PreconditionFailedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type {
  OpportunityToBe,
  OpportunityTransition,
} from "../opportunity.status-resolver.js";

import {
  OPPORTUNITY_TRANSITION,
  resolveOpportunityStatus,
} from "../opportunity.status-resolver.js";

const MOCK_OPPORTUNITY_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";
const CATEGORY_ID = "01KRJXEYD44B58700GT982CCYY";
const PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";

const sameBenefit = {
  discountType: "percentage" as const,
  type: "discount" as const,
  value: 20,
};

const changedBenefit = {
  discountType: "percentage" as const,
  type: "discount" as const,
  value: 10,
};

const currentOpportunity = (
  overrides: Partial<OpportunityDetail> = {},
): OpportunityDetail => ({
  beneficiaryBenefit: sameBenefit,
  caregiverBenefit: { type: "free" },
  categoryId: CATEGORY_ID,
  categoryTitle: "Cultura",
  createdAt: "2026-01-01T00:00:00.000Z",
  dateFrom: "2026-01-01",
  dateTo: "2026-12-31",
  id: MOCK_OPPORTUNITY_ID,
  localizedMetadata: [{ key: "name", language: "it", value: "Sconto 20%" }],
  nationalTerritory: false,
  placeIds: [PLACE_ID],
  status: "published",
  suspendFrom: null,
  updatedAt: "2026-01-01T00:00:00.000Z",
  url: "https://example.org/promo",
  ...overrides,
});

const replace = (next: OpportunityToBe): OpportunityTransition => ({
  next,
  type: OPPORTUNITY_TRANSITION.REPLACE,
});

const transition = (from: string, to: string) => ok({ from, to });

describe("resolveOpportunityStatus - replace", () => {
  it.each(["draft", "test_rejected", "test_passed"] as const)(
    "keeps the persisted status on a benefit change in the free state %s",
    (status) => {
      expect(
        resolveOpportunityStatus(
          currentOpportunity({ status }),
          replace({
            beneficiaryBenefit: changedBenefit,
            caregiverBenefit: { type: "free" },
          }),
        ),
      ).toEqual(transition(status, status));
    },
  );

  it.each([
    ["published", "published"],
    ["scheduled", "published"],
    ["suspended", "suspended"],
  ] as const)(
    "transitions %s to test_pending with persisted from %s",
    (status, from) => {
      expect(
        resolveOpportunityStatus(
          currentOpportunity({ status }),
          replace({
            beneficiaryBenefit: changedBenefit,
            caregiverBenefit: { type: "free" },
          }),
        ),
      ).toEqual(transition(from, "test_pending"));
    },
  );

  it("does not transition when the benefit is re-sent identical", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({ status: "published" }),
        replace({
          beneficiaryBenefit: sameBenefit,
          caregiverBenefit: { type: "free" },
        }),
      ),
    ).toEqual(transition("published", "published"));
  });

  it("maps scheduled with no binding change to persisted published", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({ status: "scheduled" }),
        replace({
          beneficiaryBenefit: sameBenefit,
          caregiverBenefit: { type: "free" },
        }),
      ),
    ).toEqual(transition("published", "published"));
  });

  it("treats caregiver removal by omission as binding", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({ status: "published" }),
        replace({ beneficiaryBenefit: sameBenefit }),
      ),
    ).toEqual(transition("published", "test_pending"));
  });

  it("treats caregiver addition when absent as binding", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({
          caregiverBenefit: undefined,
          status: "published",
        }),
        replace({
          beneficiaryBenefit: sameBenefit,
          caregiverBenefit: { type: "free" },
        }),
      ),
    ).toEqual(transition("published", "test_pending"));
  });

  it("does not treat a non-benefit field as binding", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({
          status: "published",
          url: "https://example.org/promo",
        }),
        replace({
          beneficiaryBenefit: sameBenefit,
          caregiverBenefit: { type: "free" },
        }),
      ),
    ).toEqual(transition("published", "published"));
  });

  it.each(["test_pending", "scheduled_suspension", "deleted"] as const)(
    "rejects replace from %s",
    (status) => {
      expect(
        resolveOpportunityStatus(
          currentOpportunity({ status }),
          replace({
            beneficiaryBenefit: sameBenefit,
            caregiverBenefit: { type: "free" },
          }),
        ),
      ).toEqual(err(expect.any(PreconditionFailedError)));
    },
  );

  it("documents that a binding edit of a suspended opportunity goes to test_pending, and approve then republishes", () => {
    expect(
      resolveOpportunityStatus(
        currentOpportunity({ status: "suspended" }),
        replace({
          beneficiaryBenefit: changedBenefit,
          caregiverBenefit: { type: "free" },
        }),
      ),
    ).toEqual(transition("suspended", "test_pending"));

    expect(
      resolveOpportunityStatus(currentOpportunity({ status: "test_pending" }), {
        type: OPPORTUNITY_TRANSITION.APPROVE,
      }),
    ).toEqual(transition("test_pending", "published"));
  });
});

describe("resolveOpportunityStatus - command transitions", () => {
  it.each([
    [
      "draft",
      { type: OPPORTUNITY_TRANSITION.REQUEST_TEST },
      "draft",
      "test_pending",
    ],
    [
      "test_pending",
      { type: OPPORTUNITY_TRANSITION.APPROVE },
      "test_pending",
      "published",
    ],
    [
      "test_rejected",
      { type: OPPORTUNITY_TRANSITION.APPROVE },
      "test_rejected",
      "published",
    ],
    [
      "test_passed",
      { type: OPPORTUNITY_TRANSITION.PUBLISH },
      "test_passed",
      "published",
    ],
    ["draft", { type: OPPORTUNITY_TRANSITION.DELETE }, "draft", "deleted"],
    [
      "scheduled",
      { type: OPPORTUNITY_TRANSITION.DELETE },
      "published",
      "deleted",
    ],
    [
      "suspended",
      { type: OPPORTUNITY_TRANSITION.DELETE },
      "suspended",
      "deleted",
    ],
    [
      "test_rejected",
      { type: OPPORTUNITY_TRANSITION.DELETE },
      "test_rejected",
      "deleted",
    ],
  ] as const)(
    "from display %s with %j yields persisted %s -> %s",
    (status, command, from, to) => {
      expect(
        resolveOpportunityStatus(currentOpportunity({ status }), command),
      ).toEqual(transition(from, to));
    },
  );

  it.each([
    ["published", { type: OPPORTUNITY_TRANSITION.REQUEST_TEST }],
    ["draft", { type: OPPORTUNITY_TRANSITION.APPROVE }],
    ["draft", { type: OPPORTUNITY_TRANSITION.PUBLISH }],
    ["published", { type: OPPORTUNITY_TRANSITION.DELETE }],
    ["test_pending", { type: OPPORTUNITY_TRANSITION.DELETE }],
  ] as const)("rejects %s with %j", (status, command) => {
    expect(
      resolveOpportunityStatus(currentOpportunity({ status }), command),
    ).toEqual(err(expect.any(PreconditionFailedError)));
  });
});
