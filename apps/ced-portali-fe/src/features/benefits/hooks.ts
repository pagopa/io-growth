import { useMemo } from 'react';
import { useGetBenefitsQuery } from './api';
import type { Benefit, BenefitState } from './types';

const IN_MANAGEMENT_STATES: Set<BenefitState> = new Set([
  'Revisione',
  'Bozza',
  'Modifiche_Richieste',
]);
const APPROVED_STATES: Set<BenefitState> = new Set([
  'Pubblicata',
  'Pubblicazione_Programmata',
]);

export function useBenefitsData() {
  const query = useGetBenefitsQuery();

  const items = useMemo(() => query.data ?? [], [query.data]);

  const inManagementItems = useMemo(
    () => items.filter((benefit) => IN_MANAGEMENT_STATES.has(benefit.state)),
    [items],
  );

  const approvedItems = useMemo(
    () => items.filter((benefit) => APPROVED_STATES.has(benefit.state)),
    [items],
  );

  return {
    ...query,
    items,
    inManagementItems,
    approvedItems,
    hasItems: Boolean(items.length),
  };
}

export function formatBenefitRow(item: Benefit) {
  return `${item.name} · ${item.category} · ${item.created_by} · ${item.state}`;
}
