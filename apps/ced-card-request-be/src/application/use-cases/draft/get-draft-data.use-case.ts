import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type { CardApplicationRepository } from "../../../domain/ports/outbound/card-application.repository.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import {
  FiscalCodeSchema,
  RecoveredApplicationDraftSchema,
} from "../../../domain/entities/card-application.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const GetDraftDataInputSchema = z.object({
  fiscalCode: FiscalCodeSchema,
});

export type GetDraftDataInput = z.infer<typeof GetDraftDataInputSchema>;

const GetDraftDataOutputSchema = RecoveredApplicationDraftSchema;

export type GetDraftDataOutput = z.infer<typeof GetDraftDataOutputSchema>;

export type GetDraftDataUseCase = UseCase<
  GetDraftDataInput,
  GetDraftDataOutput,
  BaseError
>;

export const makeGetDraftDataUseCase =
  (
    supportRecordRepository: SupportRecordRepository,
    cardApplicationRepository: CardApplicationRepository,
  ): GetDraftDataUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(
      GetDraftDataInputSchema,
      input,
    );
    if (validated.isErr()) return err(validated.error);

    const recordResult = await supportRecordRepository.getByCodiceFiscale(
      validated.value.fiscalCode,
    );
    if (recordResult.isErr()) return err(recordResult.error);
    const record = recordResult.value;
    if (!record) {
      return err(new NotFoundError("draft", validated.value.fiscalCode));
    }
    if (
      record.state !== "READY_FOR_PHOTO_UPLOAD" &&
      record.state !== "READY_FOR_DOCUMENTS_UPLOAD"
    ) {
      return err(
        new ValidationError(
          "Draft data can only be recovered from a reconciled active draft",
        ),
      );
    }
    if (!record.idLavorazione) {
      return err(
        new GenericError(
          "The reconciled support record has no idLavorazione for an active draft",
        ),
      );
    }

    const recoveryResult =
      await cardApplicationRepository.recoverApplicationDraft(
        validated.value.fiscalCode,
        record.idLavorazione,
      );
    if (recoveryResult.isErr()) return err(recoveryResult.error);

    const output = GetDraftDataOutputSchema.safeParse(recoveryResult.value);

    if (!output.success) {
      return err(
        new GenericError(
          `Invalid recovered draft: ${z.prettifyError(output.error)}`,
        ),
      );
    }

    return ok(output.data);
  };
