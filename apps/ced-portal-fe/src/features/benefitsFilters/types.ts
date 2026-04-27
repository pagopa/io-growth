export enum BenefitStatus {
  SCHEDULED_PUBLICATION = 'Pubblicazione programmata',
  DRAFT = 'In bozza',
  PUBLISHED = 'Pubblicata su IO',
  CHANGES_REQUESTED = 'Modifiche richieste',
  UNDER_REVIEW = 'In revisione',
}

export enum BenefitCategory {
  CULTURE_LEISURE = 'Cultura e tempo libero',
  EDUCATION = 'Istruzione e formazione',
  HEALTH_WELLNESS = 'Salute e benessere',
  SPORT = 'Sport',
  HOME = 'Casa',
  TELEPHONY_INTERNET = 'Telefonia e internet',
  FINANCIAL_SERVICES = 'Servizi finanziari',
  TRAVEL_TRANSPORT = 'Viaggi e Trasporti',
  SUSTAINABLE_MOBILITY = 'Mobilità sostenibile',
  WORK_INTERNSHIPS = 'Lavoro e tirocini',
}

export type BenefitFiltersState = {
  name: string | null;
  status: BenefitStatus | null;
  category: BenefitCategory | null;
};
