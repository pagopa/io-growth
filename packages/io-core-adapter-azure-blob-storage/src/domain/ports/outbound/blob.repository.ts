import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { BlobUpload } from "../../entities.js";

export interface BlobRepository {
  readonly upload: (input: BlobUpload) => Promise<Result<void, GenericError>>;
}
