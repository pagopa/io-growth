import { useMemo } from 'react';
import { ListOnboardingsStatusesItem } from '../../core/api/generated/model';
import { useListDepartmentOnboardingsQuery } from './api.js';
import type {
  DepartmentOnboardingStatus,
  EntityFilters,
  EntityItem,
} from './types.js';
import type { OnboardingItem } from '../../core/api/generated/model';

const ONBOARDING_STATUSES = new Set<string>(
  Object.values(ListOnboardingsStatusesItem),
);

const REQUEST_TAB_STATUSES: DepartmentOnboardingStatus[] = [
  ListOnboardingsStatusesItem.PENDING_IN_REVIEW,
  ListOnboardingsStatusesItem.REJECTED,
];

const MANAGED_TAB_STATUSES: DepartmentOnboardingStatus[] = [
  ListOnboardingsStatusesItem.COMPLETED,
  ListOnboardingsStatusesItem.FAILED,
  ListOnboardingsStatusesItem.DELETED,
];

const REQUEST_STATUSES = new Set<DepartmentOnboardingStatus>(
  REQUEST_TAB_STATUSES,
);

const parseOnboardingStatus = (
  status: string | undefined,
  fallback: DepartmentOnboardingStatus,
): DepartmentOnboardingStatus =>
  status && ONBOARDING_STATUSES.has(status)
    ? (status as DepartmentOnboardingStatus)
    : fallback;

interface UseEntitiesDataInput {
  activeTab: number;
  filters: EntityFilters;
  page: number;
  rowsPerPage: number;
}

const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('it-IT').format(date);
};

const toEntityItem = (
  item: OnboardingItem & { id: string },
  defaultTab: 'requests' | 'entities',
): EntityItem => {
  const fallbackStatus =
    defaultTab === 'requests'
      ? ListOnboardingsStatusesItem.PENDING_IN_REVIEW
      : ListOnboardingsStatusesItem.COMPLETED;
  const status = parseOnboardingStatus(item.status, fallbackStatus);
  const base = {
    city: `${item.city} (${item.county})`,
    id: item.id,
    name: item.institution?.description ?? 'Ente senza nome',
    state: status,
  };

  const isRequest = REQUEST_STATUSES.has(status);

  if (isRequest) {
    return {
      ...base,
      created_at: formatDate(item.createdAt),
      tab: 'requests',
    };
  }

  return {
    ...base,
    active_from: formatDate(item.updatedAt ?? item.createdAt),
    opportunities_count: item.opportunities_count ?? 0,
    tab: 'entities',
  };
};

export const useEntitiesData = ({
  activeTab,
  filters,
  page,
  rowsPerPage,
}: UseEntitiesDataInput) => {
  const pageIndex = Math.max(0, page - 1);
  const name = filters.search || undefined;
  const defaultTab: 'requests' | 'entities' =
    activeTab === 0 ? 'requests' : 'entities';
  const statuses: DepartmentOnboardingStatus[] = filters.state
    ? [filters.state]
    : defaultTab === 'requests'
      ? REQUEST_TAB_STATUSES
      : MANAGED_TAB_STATUSES;

  const query = useListDepartmentOnboardingsQuery({
    name,
    page: pageIndex,
    size: rowsPerPage,
    statuses,
  });

  const items = useMemo(
    () =>
      (query.data?.items ?? [])
        .filter((item): item is OnboardingItem & { id: string } =>
          Boolean(item.id),
        )
        .map((item) => toEntityItem(item, defaultTab)),
    [defaultTab, query.data?.items],
  );

  return {
    ...query,
    isError: query.isError,
    isLoading: query.isLoading || query.isFetching,
    items,
    total: query.data?.count ?? 0,
  };
};
