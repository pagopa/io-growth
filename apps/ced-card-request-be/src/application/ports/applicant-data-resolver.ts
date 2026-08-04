export interface ApplicantData {
  readonly cognome: string;
  readonly dataNascita?: string;
  readonly nome: string;
  readonly sesso?: "F" | "M";
}

export interface ApplicantDataResolver {
  readonly resolve: (identity: ApplicantIdentity) => ApplicantData;
}

export interface ApplicantIdentity {
  readonly familyName: string;
  readonly fiscalCode: string;
  readonly givenName: string;
}
