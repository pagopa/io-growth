import { z } from "zod";

import { MILESTONE_STATES } from "./application-state.js";

/** 0=Italiana, 2=Paesi comunitari, 3=Paesi extracomunitari. */
export const CitizenshipSchema = z.union([
  z.literal(0),
  z.literal(2),
  z.literal(3),
]);

/**
 * 1=Trento/Bolzano/Valle d'Aosta, 2=Sentenza/Decreto, 3=Invalidità ante 2010.
 */
export const DocumentationTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const FiscalCodeSchema = z.string().length(16);

/** Identifier the upstream registry assigns to a draft application. */
export const IdLavorazioneSchema = z.string().min(1).max(20);

export const GenderSchema = z.enum(["M", "F"]);

/** A new application draft, ready to be registered upstream. */
export const ApplicationDraftSchema = z.object({
  capRec: z.string().min(1),
  civicoRec: z.string().nullable(),
  codiceFiscale: FiscalCodeSchema,
  cognome: z.string().min(1),
  comuneNascita: z.string().nullable(),
  dataNascita: z.string().min(1),
  dataScadenzaPermessoSoggiorno: z.string().nullable(),
  datiAggiuntiviRec: z.string().nullable(),
  descrizioneComuneRec: z.string().min(1),
  idCittadinanza: CitizenshipSchema,
  indirizzoRec: z.string().min(1),
  informativaPrivacy: z.boolean(),
  nome: z.string().min(1),
  pressoCognome: z.string().nullable(),
  pressoDenominazione: z.string().nullable(),
  pressoNome: z.string().nullable(),
  sesso: GenderSchema,
  siglaProvinciaNascita: z.string().nullable(),
  siglaProvinciaRec: z.string().min(1),
  statoNascita: z.string().min(1),
});

/** The passport photo attached to an existing draft. */
export const ApplicationPhotoSchema = z.object({
  codiceFiscale: FiscalCodeSchema,
  fotoCED: z.string().min(1),
  idLavorazione: IdLavorazioneSchema,
  informativaFoto: z.boolean(),
});

/** Final confirmation of a draft, with optional supporting documentation. */
export const ApplicationConfirmationSchema = z.object({
  allegato: z.string().nullable(),
  autodichiarazioneSentenza: z.boolean().nullable(),
  codiceFiscale: FiscalCodeSchema,
  dataSentenza: z.string().nullable(),
  descrizioneComuneTribunale: z.string().nullable(),
  dichiarazioneConformitaVerbale: z.boolean().nullable(),
  dirittoAccompagnatore: z.boolean().nullable(),
  idLavorazione: IdLavorazioneSchema,
  nomeFile: z.string().nullable(),
  siglaProvinciaTribunale: z.string().nullable(),
  tipologiaUlterioreDocumentazione: DocumentationTypeSchema.nullable(),
});

/** Outcome of registering a new draft upstream. */
export const ApplicationDraftCreatedSchema = z.object({
  idLavorazione: z.string().nullable(),
});

/** Outcome of confirming an application upstream. */
export const ApplicationConfirmedSchema = z.object({
  /** Document number assigned once the application is acquired. */
  numDomus: z.string().nullable(),
});

/** Current upstream milestone for a citizen's application. */
export const ApplicationStateCheckSchema = z.object({
  idLavorazione: z.string().nullable(),
  state: z.enum(MILESTONE_STATES),
});

export type ApplicationConfirmation = z.infer<
  typeof ApplicationConfirmationSchema
>;

export type ApplicationConfirmed = z.infer<typeof ApplicationConfirmedSchema>;

export type ApplicationDraft = z.infer<typeof ApplicationDraftSchema>;

export type ApplicationDraftCreated = z.infer<
  typeof ApplicationDraftCreatedSchema
>;

export type ApplicationPhoto = z.infer<typeof ApplicationPhotoSchema>;

export type ApplicationStateCheck = z.infer<typeof ApplicationStateCheckSchema>;

export type Citizenship = z.infer<typeof CitizenshipSchema>;

export type DocumentationType = z.infer<typeof DocumentationTypeSchema>;
