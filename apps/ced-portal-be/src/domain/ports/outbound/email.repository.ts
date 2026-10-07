import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface EmailRepository {
  readonly sendOpportunityApprovedEmail: (
    input: SendOpportunityApprovedEmailInput,
  ) => Promise<Result<void, GenericError>>;
  readonly sendOpportunityPublishedEmail: (
    input: SendOpportunityPublishedEmailInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface SendOpportunityApprovedEmailInput {
  readonly availabilityDate: string;
  readonly opportunityName: string;
  readonly to: string;
}

export interface SendOpportunityPublishedEmailInput {
  readonly opportunityName: string;
  readonly to: string;
}
