import { SearchOpportunitiesParams } from '../core/api/generated/model';

export const searchQueryGenerator = ({
  orderBy = 'dateFrom',
  orderDirection = 'desc',
  limit,
  offset,
}: SearchOpportunitiesParams): string => {
  const searchParams = new URLSearchParams();

  searchParams.append('orderBy', orderBy);
  searchParams.append('orderDirection', orderDirection);

  if (limit !== undefined && limit !== null) {
    searchParams.append('limit', String(limit));
  }

  if (offset !== undefined && offset !== null) {
    searchParams.append('offset', String(offset));
  }

  return searchParams.toString();
};
