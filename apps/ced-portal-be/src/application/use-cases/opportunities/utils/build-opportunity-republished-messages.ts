import { okAsync, ResultAsync } from "neverthrow";

import type { MessagePayload } from "../../../../domain/entities/message-outbox.js";
import type { OpportunityDetail } from "../../../../domain/entities/opportunity.js";
import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

import { buildOpportunityPublishedMessage } from "../../../../domain/entities/message-outbox.js";

// Falls back to the opportunity id when no Italian display name is set.
const getOpportunityName = (data: OpportunityDetail): string =>
  data.localizedMetadata.find(
    (metadata) => metadata.key === "name" && metadata.language === "it",
  )?.value ?? data.id;

// Best-effort: a failed lookup must not block the republication.
export const buildOpportunityRepublishedMessages = (
  profileRepository: ProfileRepository,
  operatorId: string | undefined,
  opportunity: OpportunityDetail,
): ResultAsync<readonly MessagePayload[], never> =>
  (operatorId
    ? new ResultAsync(profileRepository.getByOperatorId(operatorId))
    : okAsync(undefined)
  )
    .map((profile) =>
      profile
        ? [
            buildOpportunityPublishedMessage({
              opportunityName: getOpportunityName(opportunity),
              to: profile.contactEmail,
            }),
          ]
        : [],
    )
    .orElse(() => okAsync([]));
