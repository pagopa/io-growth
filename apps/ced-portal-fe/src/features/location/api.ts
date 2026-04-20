import { baseApi } from '../../core/api/baseApi';
import type { AddressOption, CreateLocationPayload, Location } from './types';

export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchAddresses: builder.query<AddressOption[], string>({
      query: (q) => `/addresses/search?q=${encodeURIComponent(q)}`,
    }),
    getLocations: builder.query<Location[], void>({
      query: () => '/locations',
      providesTags: ['Locations'],
    }),
    createLocation: builder.mutation<Location, CreateLocationPayload>({
      query: (body) => ({
        url: '/locations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Locations'],
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/locations/${id}`,
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
