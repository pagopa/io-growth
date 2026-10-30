import type { OpportunityCategoryItemLabel } from '../generated/model';

export type OpportunityCategoryKey = OpportunityCategoryItemLabel;

export interface OpportunityCategoryMetadata {
  key: OpportunityCategoryKey;
  title: string;
  description: string;
}

export const OPPORTUNITY_CATEGORIES_IT: Record<
  OpportunityCategoryKey,
  OpportunityCategoryMetadata
> = {
  culture_sport: {
    key: 'culture_sport',
    title: 'Cultura, tempo libero e sport',
    description:
      'Musei, teatri, cinema, concerti, eventi locali, strutture sportive, ecc...',
  },
  education_employment: {
    key: 'education_employment',
    title: 'Formazione e lavoro',
    description:
      'Corsi di formazione, percorsi di orientamento, inclusione lavorativa, ecc...',
  },
  health_wellbeing: {
    key: 'health_wellbeing',
    title: 'Salute e benessere sociale',
    description:
      'Visite specialistiche, assistenza socio-sanitaria domiciliare, farmacie comunali, ecc...',
  },
  financial_services: {
    key: 'financial_services',
    title: 'Servizi finanziari e finanziari',
    description: 'Banche, mutui, app di investimenti o di risparmio, ecc...',
  },
  travel_tourism: {
    key: 'travel_tourism',
    title: 'Viaggi e turismo',
    description: 'Agenzie di viaggio, hotel, tour operator, ecc...',
  },
  mobility_transport: {
    key: 'mobility_transport',
    title: 'Mobilità e trasporti',
    description:
      'Compagnie di trasporti, servizi per muoversi in città, car sharing, monopattini, bici, ecc...',
  },
  citizen_services: {
    key: 'citizen_services',
    title: 'Acquisti e servizi commerciali',
    description:
      'Consegna gratuita sulla spesa online, ristorazione, shopping, ecc...',
  },
  municipal_services: {
    key: 'municipal_services',
    title: 'Servizi comunali e territoriali',
    description: 'Accesso prioritario a sportelli e uffici municipali, ecc...',
  },
};

export const OPPORTUNITY_CATEGORIES_EN: Record<
  OpportunityCategoryKey,
  OpportunityCategoryMetadata
> = {
  culture_sport: {
    key: 'culture_sport',
    title: 'Culture and sports',
    description:
      'Books, theatre, cinema, concerts, museums, sports facilities and leisure',
  },
  education_employment: {
    key: 'education_employment',
    title: 'Education and employment',
    description:
      'Schools, universities, training courses, competitions and job opportunities',
  },
  health_wellbeing: {
    key: 'health_wellbeing',
    title: 'Health and wellness',
    description:
      'Pharmacies, personal care shops, clinics and wellness centers',
  },
  financial_services: {
    key: 'financial_services',
    title: 'Financial services',
    description: 'Banks, insurance and financial services',
  },
  travel_tourism: {
    key: 'travel_tourism',
    title: 'Travel and tourism',
    description:
      'Travel agencies, accommodation facilities, hotels and tour operators',
  },
  mobility_transport: {
    key: 'mobility_transport',
    title: 'Mobility and transport',
    description:
      'Trains, planes, local public transport and shared mobility services',
  },
  citizen_services: {
    key: 'citizen_services',
    title: 'Citizen services',
    description: 'Home utilities, telephony, internet and personal services',
  },
  municipal_services: {
    key: 'municipal_services',
    title: 'Municipal services',
    description: 'Services provided by local authorities and municipal offices',
  },
};

export const getOpportunityCategory = (
  category?: string | null,
  language: string = 'it',
): OpportunityCategoryMetadata => {
  const dictionary =
    language === 'en' ? OPPORTUNITY_CATEGORIES_EN : OPPORTUNITY_CATEGORIES_IT;

  if (category && category in dictionary) {
    return dictionary[category as OpportunityCategoryKey];
  }

  return {
    key: (category as OpportunityCategoryKey) ?? 'culture_sport',
    title: category ? category.replace(/_/g, ' ') : '',
    description: '',
  };
};
