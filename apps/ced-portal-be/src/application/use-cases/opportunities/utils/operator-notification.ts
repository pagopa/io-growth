import { okAsync, ResultAsync } from "neverthrow";

import type { MessagePayload } from "../../../../domain/entities/message-outbox.js";
import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

// Falls back to the opportunity id when no Italian display name is set.
export const getOpportunityName = (data: OpportunityDetail): string =>
  data.localizedMetadata.find(
    (metadata) => metadata.key === "name" && metadata.language === "it",
  )?.value ?? data.id;

// Notifying the operator is best-effort: a failed lookup must not fail an
// otherwise valid operation, the message is simply not enqueued.
export const buildOperatorMessages = (
  profileRepository: ProfileRepository,
  operatorId: string | undefined,
  buildMessage: (to: string) => MessagePayload,
): ResultAsync<readonly MessagePayload[], never> =>
  (operatorId
    ? new ResultAsync(profileRepository.getByOperatorId(operatorId))
    : okAsync(undefined)
  )
    .map((profile) => (profile ? [buildMessage(profile.contactEmail)] : []))
    .orElse(() => okAsync([]));
