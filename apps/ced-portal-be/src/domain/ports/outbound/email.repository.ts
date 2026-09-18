import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface EmailRepository {
  readonly sendOpportunityApprovedEmail: (
    input: SendOpportunityApprovedEmailInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface SendOpportunityApprovedEmailInput {
  readonly opportunityId: string;
  readonly to: string;
}
