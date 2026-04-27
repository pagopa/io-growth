import {
  BenefitCategory,
  BenefitStatus,
} from '../../features/benefitsFilters/types';
import { BenefitType, FixedPriceBenefitType } from './types';

const genetareOptions = <T extends string>(
  enumObj: Record<T, string>,
): Array<{ value: T; label: string }> =>
  Object.entries<string>(enumObj).map(([key, label]) => ({
    value: key as T,
    label,
  }));

export const categoriesOptions = genetareOptions(BenefitCategory);
export const statusOptions = genetareOptions(BenefitStatus);
export const benefitTypeOptions = genetareOptions(BenefitType);
export const fixedPriceBenefitTypeOptions = genetareOptions(
  FixedPriceBenefitType,
);

export const categoriesDropdownDescriptions: Record<
  keyof typeof BenefitCategory,
  string
> = {
  CULTURE_LEISURE:
    'Libri, teatro, cinema, concerti, CD, dischi, cibo, bevande, ristoranti, shopping',
  HEALTH_WELLNESS: 'Negozi di cosmetici, creme, cliniche, SPA, ecc...',
  EDUCATION: 'Scuole, Università, Corsi di formazione, ecc...',
  SPORT: 'Negozi di articoli sportivi, strutture sportive, circoli, ecc...',
  HOME: 'Opportunità per la casa, mutui, gestori della luce e gas, ecc...',
  TELEPHONY_INTERNET: 'Linea fissa e internet, telefonia mobile, ecc...',
  FINANCIAL_SERVICES: 'Banche, app di investimenti o di risparmio',
  TRAVEL_TRANSPORT: 'Agenzie di viaggio, compagnie di trasporti, ecc...',
  SUSTAINABLE_MOBILITY:
    'Servizi per muoversi in città, car sharing, monopattini, bici, trasporti green, ecc...',
  WORK_INTERNSHIPS: 'Concorsi, offerte di lavoro',
};
