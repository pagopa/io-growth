import { baseApi } from '../../core/api/baseApi';
import type {
  PlaceCreateRequest,
  PlaceResponse,
} from '../../core/api/generated/model';

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlaces: builder.query<PlaceResponse[], void>({
      query: () => '/operator/places',
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
  }),
});

export const { useGetPlacesQuery, useCreatePlaceMutation } = placesApi;
