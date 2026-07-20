import { baseApi } from '../../core/api/baseApi';
import { uploadPhotoResponse } from '../../core/api/generated/endpoints/photo-upload/photo-upload';
import { FornisciFotoRequest } from '../../core/api/generated/model';

type uploadPhotoRequest = {
  body: FornisciFotoRequest;
  idempotency_key: string;
};

export const photoUploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadPhoto: builder.mutation<uploadPhotoResponse, uploadPhotoRequest>({
      query: ({ body, idempotency_key }) => ({
        url: '/image',
        method: 'POST',
        body,
        headers: {
          'Idempotency-Key': idempotency_key,
        },
      }),
    }),
  }),
});

export const { useUploadPhotoMutation } = photoUploadApi;
