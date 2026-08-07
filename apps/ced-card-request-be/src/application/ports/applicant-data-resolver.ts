export interface ApplicantData {
  readonly cognome: string;
  readonly comuneNascita?: string;
  readonly dataNascita?: string;
  readonly nome: string;
  readonly sesso?: "F" | "M";
  readonly siglaProvinciaNascita?: string;
  readonly statoNascita?: string;
}

export interface ApplicantDataResolver {
  readonly resolve: (identity: ApplicantIdentity) => Promise<ApplicantData>;
}

export interface ApplicantIdentity {
  readonly familyName: string;
  readonly fiscalCode: string;
  readonly givenName: string;
}
