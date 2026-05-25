import { baseApi } from '../../core/api/baseApi';
import type { AddressOption, CreatePlacePayload, Place } from './types';

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlaces: builder.query<Place[], void>({
      query: () => '/operator/places',
      providesTags: ['Places'],
    }),
    createPlace: builder.mutation<Place, CreatePlacePayload>({
      query: (body) => ({
        url: '/operator/places',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Places'],
    }),
    searchAddresses: builder.query<AddressOption[], string>({
      query: (q) => `/addresses/search?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useGetPlacesQuery,
  useLazyGetPlacesQuery,
  useCreatePlaceMutation,
  useLazySearchAddressesQuery,
} = placesApi;
