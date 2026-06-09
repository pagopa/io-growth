import { useMemo } from 'react';
import { ListOnboardingsStatus } from '../../core/api/generated/model';
import { useListDepartmentOnboardingsQuery } from './api.js';
import type {
  DepartmentOnboardingStatus,
  EntityFilters,
  EntityItem,
} from './types.js';
import type { OnboardingItem } from '../../core/api/generated/model';

const ONBOARDING_STATUSES = new Set<string>(
  Object.values(ListOnboardingsStatus),
);

const REQUEST_STATUSES = new Set<DepartmentOnboardingStatus>([
  ListOnboardingsStatus.REQUEST,
  ListOnboardingsStatus.TOBEVALIDATED,
  ListOnboardingsStatus.PENDING,
  ListOnboardingsStatus.PENDING_IN_REVIEW,
]);

const REQUEST_STATUS_VALUES = new Set<string>(
  Array.from(REQUEST_STATUSES.values()),
);

const UNFILTERED_ENTITIES_FETCH_SIZE = 50;

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
      ? ListOnboardingsStatus.REQUEST
      : ListOnboardingsStatus.COMPLETED;
  const status = parseOnboardingStatus(item.status, fallbackStatus);
  const base = {
    city: item.institution?.city ?? item.institution?.county ?? '-',
    id: item.id,
    name: item.institution?.description ?? 'Ente senza nome',
    state: status,
  };

  const isRequest = REQUEST_STATUS_VALUES.has(item.status ?? '')
    ? REQUEST_STATUSES.has(status)
    : defaultTab === 'requests';

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
    opportunities_count: item.opportunityCount ?? 0,
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
  const defaultStatus =
    activeTab === 0 ? ListOnboardingsStatus.PENDING_IN_REVIEW : undefined;

  const selectedStatus = filters.state || defaultStatus;
  const shouldClientPaginateEntities = activeTab === 1 && !filters.state;
  const defaultTab: 'requests' | 'entities' =
    activeTab === 0 ? 'requests' : 'entities';

  const query = useListDepartmentOnboardingsQuery({
    name,
    page: shouldClientPaginateEntities ? 0 : pageIndex,
    size: shouldClientPaginateEntities
      ? UNFILTERED_ENTITIES_FETCH_SIZE
      : rowsPerPage,
    status: selectedStatus,
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

  const tabItems = useMemo(() => {
    if (!shouldClientPaginateEntities) {
      return items;
    }

    return items.filter((item) => item.tab === 'entities');
  }, [items, shouldClientPaginateEntities]);

  const paginatedTabItems = useMemo(() => {
    if (!shouldClientPaginateEntities) {
      return [] as EntityItem[];
    }

    const start = pageIndex * rowsPerPage;
    return tabItems.slice(start, start + rowsPerPage);
  }, [tabItems, pageIndex, rowsPerPage, shouldClientPaginateEntities]);

  return {
    isError: query.isError,
    isLoading: query.isLoading || query.isFetching,
    items: shouldClientPaginateEntities ? paginatedTabItems : items,
    total: shouldClientPaginateEntities
      ? tabItems.length
      : (query.data?.count ?? 0),
  };
};
