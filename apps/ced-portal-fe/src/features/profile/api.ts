import { baseApi } from '../../core/api/baseApi';
import type {
  OperatorProfileResponse,
  OperatorProfileCreateRequest,
} from '../../core/api/generated/model';

const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperatorProfile: builder.query<OperatorProfileResponse, void>({
      query: () => '/operator/profile',
      providesTags: ['Profile'],
    }),

    createOperatorProfile: builder.mutation<
      OperatorProfileResponse,
      OperatorProfileCreateRequest
    >({
      query: (body) => ({
        url: '/operator/profile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetOperatorProfileQuery, useCreateOperatorProfileMutation } =
  profileApi;
