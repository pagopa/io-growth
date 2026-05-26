import { baseApi } from '../../core/api/baseApi';
import type { CreatePlacePayload, Place } from './types';

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
  }),
});

export const { useGetPlacesQuery, useCreatePlaceMutation } = placesApi;
