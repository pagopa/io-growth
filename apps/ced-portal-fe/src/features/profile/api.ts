import { baseApi } from '../../core/api/baseApi';
import type {
  OperatorProfileResponse,
  OperatorProfileCreateRequest,
} from '../../generated/model';

type CreateOperatorProfileArgs = {
  profile: OperatorProfileCreateRequest;
  logo: File;
  image: File;
};

const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOperatorProfile: builder.query<OperatorProfileResponse, void>({
      query: () => '/operator/profile',
      providesTags: ['Profile'],
    }),

    createOperatorProfile: builder.mutation<
      OperatorProfileResponse,
      CreateOperatorProfileArgs
    >({
      query: ({ profile, logo, image }) => {
        const body = new FormData();
        body.append(
          'profile',
          new Blob([JSON.stringify(profile)], { type: 'application/json' }),
        );
        body.append('logo', logo);
        body.append('image', image);

        return {
          url: '/operator/profile',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetOperatorProfileQuery, useCreateOperatorProfileMutation } =
  profileApi;
