import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { Profile } from "../../../../domain/entities/profile.js";

import { makeAdminCancelScheduledSuspensionUseCase } from "../admin-cancel-scheduled-suspension.use-case.js";
import { makeAdminRejectOpportunityRepublishUseCase } from "../admin-reject-opportunity-republish.use-case.js";
import { makeAdminRepublishOpportunityUseCase } from "../admin-republish-opportunity.use-case.js";
import { makeAdminSuspendOpportunityUseCase } from "../admin-suspend-opportunity.use-case.js";
import { makeOperatorCancelScheduledSuspensionUseCase } from "../operator-cancel-scheduled-suspension.use-case.js";
import { makeOperatorDeleteOpportunityUseCase } from "../operator-delete-opportunity.use-case.js";
import { makeOperatorRepublishOpportunityUseCase } from "../operator-republish-opportunity.use-case.js";
import { makeOperatorRequestOpportunityRepublishUseCase } from "../operator-request-opportunity-republish.use-case.js";
import { makeOperatorRequestOpportunityTestUseCase } from "../operator-request-opportunity-test.use-case.js";
import { makeOperatorSuspendOpportunityUseCase } from "../operator-suspend-opportunity.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  createMockProfileRepository,
  MOCK_ADMIN_EMAIL,
  MOCK_EMAIL_LINKS,
  MOCK_MAILING_CONFIG,
  MOCK_OPERATOR_ID,
  mockOpportunityDetail,
  mockProfile,
} from "./mocks.js";

const opportunity: OpportunityDetail = {
  ...mockOpportunityDetail,
  dateTo: "2099-12-31",
  operatorId: MOCK_OPERATOR_ID,
  status: "suspended",
};
const input = { operatorId: MOCK_OPERATOR_ID, opportunityId: opportunity.id };
const opportunityName = "Sconto 20%";
const reason = "Motivo della richiesta";

const makeDeps = (
  overrides: Partial<OpportunityDetail>,
  profile: Result<Profile | undefined, GenericError> = ok(mockProfile),
) => ({
  materialized: createMockMaterializedViewRepository(),
  profile: createMockProfileRepository({
    getByOperatorId: vi.fn().mockResolvedValue(profile),
  }),
  repository: createMockOpportunityRepository({
    cancelScheduledSuspensionById: vi.fn().mockResolvedValue(ok(undefined)),
    cancelScheduledSuspensionByIdAndOperatorId: vi
      .fn()
      .mockResolvedValue(ok(undefined)),
    deleteByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    findById: vi.fn().mockResolvedValue(ok({ ...opportunity, ...overrides })),
    findByIdAndOperatorId: vi
      .fn()
      .mockResolvedValue(ok({ ...opportunity, ...overrides })),
    rejectRepublishById: vi.fn().mockResolvedValue(ok(undefined)),
    republishById: vi.fn().mockResolvedValue(ok(undefined)),
    republishByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    requestRepublishByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    suspendById: vi.fn().mockResolvedValue(ok(undefined)),
    suspendByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    updateStatusByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
  }),
});

type Dependencies = ReturnType<typeof makeDeps>;
type Mutation = Exclude<
  keyof Dependencies["repository"],
  "create" | `count${string}` | `exists${string}` | `find${string}`
>;
interface Scenario {
  method: Mutation;
  name: string;
  notifications: {
    attributes?: Record<string, string>;
    recipient: "admin" | "operator";
    templateId: string;
  }[];
  opportunity: Partial<OpportunityDetail>;
  requiresProfile?: boolean;
  run: (deps: Dependencies) => Promise<Result<void, BaseError>>;
}

const adminAttributes = { operatorName: mockProfile.displayName };
const scenarios: Scenario[] = [
  {
    method: "republishById",
    name: "department republication",
    notifications: [
      {
        recipient: "operator",
        templateId: "ced_operator-opportunity-republished_v1",
      },
    ],
    opportunity: { suspendedBy: "department" },
    run: (d) =>
      makeAdminRepublishOpportunityUseCase(
        d.repository,
        d.materialized,
        d.profile,
        MOCK_EMAIL_LINKS,
      )(input),
  },
  {
    method: "rejectRepublishById",
    name: "republication refusal",
    notifications: [
      {
        recipient: "operator",
        templateId: "ced_operator-opportunity-republish-rejected_v1",
      },
    ],
    opportunity: { republishMessage: reason, suspendedBy: "department" },
    run: (d) =>
      makeAdminRejectOpportunityRepublishUseCase(
        d.repository,
        d.profile,
        MOCK_EMAIL_LINKS,
      )({ ...input, republishRejectionMessage: reason }),
  },
  ...["2026-07-14", "2026-08-01"].map(
    (date): Scenario => ({
      method: "suspendById",
      name: `department suspension ${date}`,
      notifications: [
        {
          attributes: {
            suspensionDate: date === "2026-08-01" ? "01/08/2026" : "15/07/2026",
            suspensionMessage: reason,
          },
          recipient: "operator",
          templateId: "ced_operator-opportunity-suspended_v1",
        },
      ],
      opportunity: { status: "published" },
      run: (d) =>
        makeAdminSuspendOpportunityUseCase(
          d.repository,
          d.materialized,
          d.profile,
          MOCK_EMAIL_LINKS,
        )({ ...input, suspendFrom: date, suspensionMessage: reason }),
    }),
  ),
  {
    method: "cancelScheduledSuspensionById",
    name: "department cancellation",
    notifications: [
      {
        attributes: { suspensionDate: "01/08/2026" },
        recipient: "operator",
        templateId: "ced_operator-opportunity-suspension-cancelled_v1",
      },
    ],
    opportunity: {
      status: "scheduled_suspension",
      suspendedBy: "department",
      suspendFrom: "2026-08-01",
    },
    run: (d) =>
      makeAdminCancelScheduledSuspensionUseCase(
        d.repository,
        d.profile,
        MOCK_EMAIL_LINKS,
      )(input),
  },
  ...["draft", "suspended"].map(
    (status): Scenario => ({
      method: "deleteByIdAndOperatorId",
      name: `operator deletion ${status}`,
      notifications: [
        {
          recipient: "operator",
          templateId: "ced_operator-opportunity-deleted_v1",
        },
        ...(status === "draft"
          ? []
          : [
              {
                attributes: {
                  ...adminAttributes,
                  deletionDate: new Date("2026-07-15").toLocaleDateString(
                    "it-IT",
                  ),
                  deletionMessage: reason,
                },
                recipient: "admin" as const,
                templateId: "ced_admin-opportunity-deleted_v1",
              },
            ]),
      ],
      opportunity: { status: status === "draft" ? "draft" : "suspended" },
      run: (d) =>
        makeOperatorDeleteOpportunityUseCase(
          d.repository,
          d.profile,
          MOCK_MAILING_CONFIG,
        )({ ...input, deletionMessage: reason }),
    }),
  ),
  {
    method: "republishByIdAndOperatorId",
    name: "operator self-republication",
    notifications: [
      {
        recipient: "operator",
        templateId: "ced_operator-opportunity-self-republished_v1",
      },
      {
        attributes: adminAttributes,
        recipient: "admin",
        templateId: "ced_admin-opportunity-republished_v1",
      },
    ],
    opportunity: { suspendedBy: "operator" },
    run: (d) =>
      makeOperatorRepublishOpportunityUseCase(
        d.repository,
        d.materialized,
        d.profile,
        MOCK_MAILING_CONFIG,
      )(input),
  },
  ...["2026-07-14", "2026-08-01"].map(
    (date): Scenario => ({
      method: "suspendByIdAndOperatorId",
      name: `operator suspension ${date}`,
      notifications: [
        {
          attributes: {
            ...adminAttributes,
            suspensionDate: date === "2026-08-01" ? "01/08/2026" : "15/07/2026",
            suspensionMessage: reason,
          },
          recipient: "admin",
          templateId: "ced_admin-opportunity-suspended_v1",
        },
      ],
      opportunity: { status: "published" },
      run: (d) =>
        makeOperatorSuspendOpportunityUseCase(
          d.repository,
          d.materialized,
          d.profile,
          MOCK_MAILING_CONFIG,
        )({ ...input, suspendFrom: date, suspensionMessage: reason }),
    }),
  ),
  {
    method: "cancelScheduledSuspensionByIdAndOperatorId",
    name: "operator cancellation",
    notifications: [
      {
        attributes: adminAttributes,
        recipient: "admin",
        templateId: "ced_admin-opportunity-suspension-cancelled_v1",
      },
    ],
    opportunity: {
      status: "scheduled_suspension",
      suspendedBy: "operator",
      suspendFrom: "2026-08-01",
    },
    run: (d) =>
      makeOperatorCancelScheduledSuspensionUseCase(
        d.repository,
        d.profile,
        MOCK_MAILING_CONFIG,
      )(input),
  },
  {
    method: "requestRepublishByIdAndOperatorId",
    name: "operator republication request",
    notifications: [
      {
        attributes: { ...adminAttributes, republishMessage: reason },
        recipient: "admin",
        templateId: "ced_admin-opportunity-republish-request_v1",
      },
    ],
    opportunity: { suspendedBy: "department" },
    run: (d) =>
      makeOperatorRequestOpportunityRepublishUseCase(
        d.repository,
        d.profile,
        MOCK_MAILING_CONFIG,
      )({ ...input, republishMessage: reason }),
  },
  ...["draft", "test_rejected"].map(
    (status): Scenario => ({
      method: "updateStatusByIdAndOperatorId",
      name: `submission ${status}`,
      notifications: [
        {
          attributes: adminAttributes,
          recipient: "admin",
          templateId:
            status === "draft"
              ? "ced_admin-new-opportunity_v2"
              : "ced_admin-revise-opportunity_v1",
        },
      ],
      opportunity: { status: status === "draft" ? "draft" : "test_rejected" },
      requiresProfile: true,
      run: (d) =>
        makeOperatorRequestOpportunityTestUseCase(
          d.repository,
          d.profile,
          MOCK_MAILING_CONFIG,
        )(input),
    }),
  ),
];

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-15T10:00:00Z"));
});
afterEach(() => vi.useRealTimers());

describe.each(scenarios)("$name notification", (scenario) => {
  it("queues exactly the scenario-specific templates, recipients and attributes", async () => {
    const deps = makeDeps(scenario.opportunity);
    await expect(scenario.run(deps)).resolves.toEqual(ok(undefined));
    expect(deps.repository[scenario.method]).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        outboxMessages: scenario.notifications.map((notification) => ({
          templateAttributes: {
            ...MOCK_EMAIL_LINKS,
            opportunityName,
            ...notification.attributes,
          },
          templateId: notification.templateId,
          to:
            notification.recipient === "operator"
              ? mockProfile.contactEmail
              : MOCK_ADMIN_EMAIL,
          type: "template",
        })),
      }),
    );
  });
});

describe.each(scenarios.filter((scenario) => !scenario.requiresProfile))(
  "$name best-effort contact lookup",
  (scenario) => {
    it.each([
      ["missing profile", ok(undefined)],
      ["profile lookup failure", err(new GenericError("lookup failed"))],
    ])("preserves behavior for %s", async (_name, profile) => {
      const deps = makeDeps(scenario.opportunity, profile);
      await expect(scenario.run(deps)).resolves.toEqual(ok(undefined));
      expect(deps.repository[scenario.method]).toHaveBeenCalledWith(
        expect.objectContaining({ outboxMessages: [] }),
      );
    });
  },
);

describe.each(scenarios.filter((scenario) => scenario.requiresProfile))(
  "$name mandatory contact lookup",
  (scenario) => {
    it("does not submit without an operator profile", async () => {
      const deps = makeDeps(scenario.opportunity, ok(undefined));
      const result = await scenario.run(deps);
      expect(result.isErr()).toBe(true);
      expect(deps.repository[scenario.method]).not.toHaveBeenCalled();
    });
  },
);

it("captures the cancelled suspension date before it is cleared", async () => {
  const deps = makeDeps({
    status: "scheduled_suspension",
    suspendFrom: "2026-08-01",
  });
  await makeAdminCancelScheduledSuspensionUseCase(
    deps.repository,
    deps.profile,
    MOCK_EMAIL_LINKS,
  )(input);
  expect(deps.repository.cancelScheduledSuspensionById).toHaveBeenCalledWith(
    expect.objectContaining({ expectedSuspendFrom: "2026-08-01" }),
  );
});
