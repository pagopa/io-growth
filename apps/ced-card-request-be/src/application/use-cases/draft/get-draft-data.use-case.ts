import type { GestioneDomandaCedRepository } from "@pagopa/io-core-adapter-inps-ced";
import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import {
  GenericError,
  NotFoundError,
  ValidationError,
} from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const GetDraftDataInputSchema = z.object({
  fiscalCode: z.string().length(16),
});

export type GetDraftDataInput = z.infer<typeof GetDraftDataInputSchema>;

const GetDraftDataOutputSchema = z.object({
  capRec: z.string().max(5),
  civicoRec: z.string().max(10).nullish(),
  codiceFiscale: z.string().length(16),
  cognome: z.string().max(50),
  comuneNascita: z.string().max(60).nullish(),
  dataNascita: z.string().min(1),
  dataScadenzaPermessoSoggiorno: z.string().min(1).nullish(),
  datiAggiuntiviRec: z.string().max(45).nullish(),
  descrizioneComuneRec: z.string().max(60),
  fotoCED: z.string().nullish(),
  idCittadinanza: z.union([z.literal(0), z.literal(2), z.literal(3)]),
  indirizzoRec: z.string().max(30),
  nome: z.string().max(50),
  pressoCognome: z.string().max(40).nullish(),
  pressoDenominazione: z.string().max(40).nullish(),
  pressoNome: z.string().max(40).nullish(),
  sesso: z.enum(["M", "F"]),
  siglaProvinciaNascita: z.string().max(2).nullish(),
  siglaProvinciaRec: z.string().max(2),
  statoNascita: z.string().max(60),
});

export type GetDraftDataOutput = z.infer<typeof GetDraftDataOutputSchema>;

export type GetDraftDataUseCase = UseCase<
  GetDraftDataInput,
  GetDraftDataOutput,
  BaseError
>;

export const makeGetDraftDataUseCase =
  (
    supportRecordRepository: SupportRecordRepository,
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
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
      await gestioneDomandaCedRepository.recuperoDatiDomanda({
        codiceFiscale: validated.value.fiscalCode,
        idLavorazione: record.idLavorazione,
      });
    if (recoveryResult.isErr()) return err(recoveryResult.error);

    const { anagrafica, fotoCED, recapito } = recoveryResult.value;
    const output = GetDraftDataOutputSchema.safeParse({
      capRec: recapito.cap,
      civicoRec: recapito.civico,
      codiceFiscale: anagrafica.codiceFiscale,
      cognome: anagrafica.cognome,
      comuneNascita: anagrafica.comuneNascita,
      dataNascita: anagrafica.dataNascita,
      dataScadenzaPermessoSoggiorno: anagrafica.dataScadenzaPermessoSoggiorno,
      datiAggiuntiviRec: recapito.datiAggiuntivi,
      descrizioneComuneRec: recapito.descrizioneComune,
      fotoCED,
      idCittadinanza: anagrafica.idCittadinanza,
      indirizzoRec: recapito.indirizzo,
      nome: anagrafica.nome,
      pressoCognome: recapito.pressoCognome,
      pressoDenominazione: recapito.pressoDenominazione,
      pressoNome: recapito.pressoNome,
      sesso: anagrafica.sesso,
      siglaProvinciaNascita: anagrafica.siglaProvinciaNascita,
      siglaProvinciaRec: recapito.siglaProvincia,
      statoNascita: anagrafica.statoNascita,
    });

    if (!output.success) {
      return err(
        new GenericError(
          `INPS RecuperoDatiDomanda returned invalid data: ${z.prettifyError(output.error)}`,
        ),
      );
    }

    return ok(output.data);
  };
