import { baseApi } from '../../core/api/baseApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  PlaceCreateRequest,
  PlaceResponse,
  PlaceListResponse,
} from '../../generated/model';

export type GetPlacesArgs = {
  offset?: number;
  limit?: number;
  search?: string;
  type?: string;
};

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlaces: builder.query<PlaceListResponse, GetPlacesArgs>({
      query: (args = {}) => {
        const params = new URLSearchParams();
        if (args.search) params.append('search', args.search);
        if (args.type && args.type !== 'both') params.append('type', args.type);
        if (args.limit) params.append('limit', String(args.limit));
        if (args.offset !== undefined)
          params.append('offset', String(args.offset));

        const q = params.toString();
        return `/operator/places${q ? `?${q}` : ''}`;
      },
      providesTags: ['Places'],
    }),
    getPlaceById: builder.query<PlaceResponse, string>({
      query: (id) => `/operator/places/${id}`,
      providesTags: ['Places'],
    }),
    getPlacesByIds: builder.query<PlaceResponse[], string[]>({
      queryFn: async (ids, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const results = await Promise.all(
            ids.map((id) => fetchWithBQ(`/operator/places/${id}`)),
          );
          const hasError = results.some((result) => result.error);
          if (hasError) {
            return {
              error: results.find((result) => result.error)
                ?.error as FetchBaseQueryError,
            };
          }
          return {
            data: results.map((result) => result.data as PlaceResponse),
          };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['Places'],
    }),
    createPlace: builder.mutation<PlaceResponse, PlaceCreateRequest>({
      query: (body) => ({
        url: '/operator/places',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Places'],
    }),
    deletePlace: builder.mutation<void, string>({
      query: (placeId) => ({
        url: `/operator/places/${placeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Places'],
    }),
  }),
});

export const {
  useGetPlacesQuery,
  useGetPlaceByIdQuery,
  useGetPlacesByIdsQuery,
  useCreatePlaceMutation,
  useDeletePlaceMutation,
} = placesApi;
