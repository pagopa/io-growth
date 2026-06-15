import type { EntityDetail } from '../../features/entities/types.js';

export type DetailField = {
  label: string;
  value: string;
};

const buildField = (
  label: string,
  value: string | number | boolean | undefined | null,
): DetailField | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return {
    label,
    value: typeof value === 'boolean' ? (value ? 'Sì' : 'No') : String(value),
  };
};

const joinGeographicTaxonomies = (
  geographicTaxonomies: Array<{ code?: string; desc?: string }> | undefined,
) =>
  geographicTaxonomies
    ?.map(({ desc }) => desc)
    .filter((desc): desc is string => Boolean(desc))
    .join(', ');

export const getEntityName = (onboarding: EntityDetail | undefined) =>
  onboarding?.institution?.description ?? 'Ente senza nome';

export const getEntityFields = (onboarding: EntityDetail | undefined) =>
  onboarding
    ? [
        buildField('Prodotto', onboarding.productId),
        buildField(
          'Tipologia di soggetto aderente',
          onboarding.institution?.institutionType,
        ),
        buildField('Ragione sociale', onboarding.institution?.description),
        buildField('Sede legale', onboarding.institution?.address),
        buildField('CAP', onboarding.institution?.zipCode),
        buildField('Email PEC', onboarding.institution?.digitalAddress),
        buildField('Partita IVA', onboarding.institution?.taxCode),
        buildField(
          'La P IVA è di gruppo',
          onboarding.institution?.paymentServiceProvider?.vatNumberGroup,
        ),
        buildField('Codice SDI', onboarding.institution?.originId),
        buildField(
          'Luogo di iscrizione al Registro delle Imprese',
          onboarding.institution?.origin,
        ),
        buildField('REA (facoltativo)', onboarding.institution?.rea),
        buildField(
          'Indirizzo email visibile ai cittadini',
          onboarding.institution?.supportEmail,
        ),
      ].filter((field): field is DetailField => Boolean(field))
    : [];

export const getGeographicFields = (onboarding: EntityDetail | undefined) =>
  onboarding
    ? [
        buildField('Area di competenza', onboarding.workflowType),
        buildField(
          'Area geografica',
          joinGeographicTaxonomies(
            onboarding.institution?.geographicTaxonomies,
          ),
        ),
      ].filter((field): field is DetailField => Boolean(field))
    : [];

export const getLegalRepresentativeFields = (
  onboarding: EntityDetail | undefined,
) =>
  onboarding
    ? [
        buildField(
          'Nome e cognome',
          (() => {
            const mainUser = onboarding.users?.find(
              (u) => u.role === 'MANAGER',
            );
            const name = mainUser?.name ?? '';
            const surname = mainUser?.surname ?? '';
            const fullName = `${name} ${surname}`.trim();
            return fullName || undefined;
          })(),
        ),
        buildField(
          'Indirizzo email',
          (
            onboarding.users?.find((u) => u.role === 'MANAGER') ??
            onboarding.users?.[0]
          )?.email,
        ),
      ].filter((field): field is DetailField => Boolean(field))
    : [];
