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

const UNFILTERED_TAB_FETCH_SIZE = 50;

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
  const selectedStatus = filters.state || undefined;
  const shouldClientPaginateByTab = !filters.state;
  const defaultTab: 'requests' | 'entities' =
    activeTab === 0 ? 'requests' : 'entities';

  const query = useListDepartmentOnboardingsQuery({
    name,
    page: shouldClientPaginateByTab ? 0 : pageIndex,
    size: shouldClientPaginateByTab ? UNFILTERED_TAB_FETCH_SIZE : rowsPerPage,
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
    if (!shouldClientPaginateByTab) {
      return items;
    }

    return items.filter((item) => item.tab === defaultTab);
  }, [defaultTab, items, shouldClientPaginateByTab]);

  const paginatedTabItems = useMemo(() => {
    if (!shouldClientPaginateByTab) {
      return [] as EntityItem[];
    }

    const start = pageIndex * rowsPerPage;
    return tabItems.slice(start, start + rowsPerPage);
  }, [tabItems, pageIndex, rowsPerPage, shouldClientPaginateByTab]);

  return {
    isError: query.isError,
    isLoading: query.isLoading || query.isFetching,
    items: shouldClientPaginateByTab ? paginatedTabItems : items,
    total: shouldClientPaginateByTab
      ? tabItems.length
      : (query.data?.count ?? 0),
  };
};
