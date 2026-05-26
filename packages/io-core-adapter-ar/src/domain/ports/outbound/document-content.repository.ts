import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface DocumentContentRepository {
  readonly getContractSigned: (
    onboardingId: string,
  ) => Promise<Result<Blob, GenericError>>;
}
