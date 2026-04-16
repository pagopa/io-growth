import { baseApi } from '../../core/api/baseApi';
import type { AddressOption, CreateLocationPayload, Location } from './types';

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchAddresses: builder.query<AddressOption[], string>({
      query: (q) => `/addresses/search?q=${encodeURIComponent(q)}`,
    }),
    getLocations: builder.query<Location[], void>({
      query: () => '/sedi',
      providesTags: ['Locations'],
    }),
    createLocation: builder.mutation<Location, CreateLocationPayload>({
      query: (body) => ({
        url: '/sedi',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Locations'],
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sedi/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),
  }),
});

export const {
  useSearchAddressesQuery,
  useGetLocationsQuery,
  useCreateLocationMutation,
  useDeleteLocationMutation,
} = locationApi;
