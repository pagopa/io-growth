import { PreconditionFailedError } from "@pagopa/io-core-domain/errors";
import { err, ok, type Result } from "neverthrow";

import {
  type BenefitSummary,
  type Opportunity,
  OPPORTUNITY_DISPLAY_STATUS,
  OPPORTUNITY_STATUS,
  type OpportunityDetail,
} from "../../domain/entities/opportunity.js";

export const OPPORTUNITY_TRANSITION = {
  APPROVE: "approve",
  DELETE: "delete",
  PUBLISH: "publish",
  REPLACE: "replace",
  REQUEST_TEST: "request_test",
} as const;

export interface OpportunityToBe {
  readonly beneficiaryBenefit: BenefitSummary;
  readonly caregiverBenefit?: BenefitSummary;
}

export type OpportunityTransition =
  | {
      readonly next: OpportunityToBe;
      readonly type: typeof OPPORTUNITY_TRANSITION.REPLACE;
    }
  | { readonly type: typeof OPPORTUNITY_TRANSITION.APPROVE }
  | { readonly type: typeof OPPORTUNITY_TRANSITION.DELETE }
  | { readonly type: typeof OPPORTUNITY_TRANSITION.PUBLISH }
  | { readonly type: typeof OPPORTUNITY_TRANSITION.REQUEST_TEST };

// Status-only transition. `from` is the persisted source status to use in
// repository CAS (display statuses like "scheduled" map to "published").
// Suspension scheduling/cancellation is actor-specific and lives elsewhere.
export interface ResolvedOpportunityTransition {
  readonly from: Opportunity["status"];
  readonly to: Opportunity["status"];
}

type DisplayStatus = OpportunityDetail["status"];
type PersistedStatus = Opportunity["status"];
type TransitionResult = Result<
  ResolvedOpportunityTransition,
  PreconditionFailedError
>;

const toPersistedStatus = (status: DisplayStatus): PersistedStatus => {
  if (
    status === OPPORTUNITY_DISPLAY_STATUS.SCHEDULED ||
    status === OPPORTUNITY_DISPLAY_STATUS.SCHEDULED_SUSPENSION
  ) {
    return OPPORTUNITY_STATUS.PUBLISHED;
  }

  return status;
};

const benefitChanged = (
  incoming: BenefitSummary | undefined,
  current: BenefitSummary | null | undefined,
): boolean => {
  const currentNormalized = current ?? undefined;
  if (incoming === undefined || currentNormalized === undefined) {
    return incoming !== currentNormalized;
  }

  return (
    incoming.type !== currentNormalized.type ||
    ("value" in incoming ? incoming.value : undefined) !==
      ("value" in currentNormalized ? currentNormalized.value : undefined) ||
    ("discountType" in incoming ? incoming.discountType : undefined) !==
      ("discountType" in currentNormalized
        ? currentNormalized.discountType
        : undefined) ||
    ("description" in incoming ? incoming.description : undefined) !==
      ("description" in currentNormalized
        ? currentNormalized.description
        : undefined)
  );
};

const illegal = (message: string): TransitionResult =>
  err(new PreconditionFailedError(message));

const resolved = (
  current: DisplayStatus,
  to: PersistedStatus,
): TransitionResult => ok({ from: toPersistedStatus(current), to });

const fromStatus = (
  current: DisplayStatus,
  allowed: readonly DisplayStatus[],
  to: PersistedStatus,
  message: string,
): TransitionResult =>
  allowed.includes(current) ? resolved(current, to) : illegal(message);

const resolveReplace = (
  current: OpportunityDetail,
  next: OpportunityToBe,
): TransitionResult => {
  switch (current.status) {
    case OPPORTUNITY_DISPLAY_STATUS.SCHEDULED:
    case OPPORTUNITY_STATUS.PUBLISHED:
    case OPPORTUNITY_STATUS.SUSPENDED: {
      const isBinding =
        benefitChanged(next.beneficiaryBenefit, current.beneficiaryBenefit) ||
        benefitChanged(next.caregiverBenefit, current.caregiverBenefit);

      return resolved(
        current.status,
        isBinding
          ? OPPORTUNITY_STATUS.TEST_PENDING
          : toPersistedStatus(current.status),
      );
    }
    case OPPORTUNITY_DISPLAY_STATUS.SCHEDULED_SUSPENSION:
      return illegal(
        "A scheduled suspension is pending: cancel it or wait for it to apply before modifying",
      );
    case OPPORTUNITY_STATUS.DELETED:
      return illegal("Opportunity in status deleted cannot be modified");
    case OPPORTUNITY_STATUS.DRAFT:
    case OPPORTUNITY_STATUS.TEST_PASSED:
    case OPPORTUNITY_STATUS.TEST_REJECTED:
      return resolved(current.status, current.status);
    case OPPORTUNITY_STATUS.TEST_PENDING:
      return illegal("Opportunity is under review and cannot be modified");
  }
};

const resolveDelete = (current: DisplayStatus): TransitionResult => {
  switch (current) {
    case OPPORTUNITY_DISPLAY_STATUS.SCHEDULED:
    case OPPORTUNITY_STATUS.DRAFT:
    case OPPORTUNITY_STATUS.SUSPENDED:
    case OPPORTUNITY_STATUS.TEST_REJECTED:
      return resolved(current, OPPORTUNITY_STATUS.DELETED);
    case OPPORTUNITY_STATUS.PUBLISHED:
      return illegal("Opportunity must be suspended before deletion");
    case OPPORTUNITY_STATUS.TEST_PENDING:
      return illegal("Opportunity cannot be deleted while under review");
    default:
      return illegal(`Opportunity in status ${current} cannot be deleted`);
  }
};

export const resolveOpportunityStatus = (
  current: OpportunityDetail,
  transition: OpportunityTransition,
): TransitionResult => {
  switch (transition.type) {
    case OPPORTUNITY_TRANSITION.APPROVE:
      return fromStatus(
        current.status,
        [OPPORTUNITY_STATUS.TEST_PENDING, OPPORTUNITY_STATUS.TEST_REJECTED],
        OPPORTUNITY_STATUS.PUBLISHED,
        "Opportunity must be in test_pending or test_rejected status to be approved",
      );
    case OPPORTUNITY_TRANSITION.DELETE:
      return resolveDelete(current.status);
    case OPPORTUNITY_TRANSITION.PUBLISH:
      return fromStatus(
        current.status,
        [OPPORTUNITY_STATUS.TEST_PASSED],
        OPPORTUNITY_STATUS.PUBLISHED,
        "Opportunity must be in test_passed status to be published",
      );
    case OPPORTUNITY_TRANSITION.REPLACE:
      return resolveReplace(current, transition.next);
    case OPPORTUNITY_TRANSITION.REQUEST_TEST:
      return fromStatus(
        current.status,
        [OPPORTUNITY_STATUS.DRAFT],
        OPPORTUNITY_STATUS.TEST_PENDING,
        "Opportunity must be in draft status to request testing",
      );
  }
};
