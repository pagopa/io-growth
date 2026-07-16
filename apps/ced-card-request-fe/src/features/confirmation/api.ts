import { baseApi } from '../../core/api/baseApi';
import { confirmApplicationResponse } from '../../core/api/generated/endpoints/confirmation-and-documentation/confirmation-and-documentation';
import { ConfermaDomandaRequest } from '../../core/api/generated/model';

type ConfirmApplicationRequest = {
  body: ConfermaDomandaRequest;
  idempotency_key: string;
};

export const confirmationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDraftRequest: builder.mutation<
      confirmApplicationResponse,
      ConfirmApplicationRequest
    >({
      query: ({ body, idempotency_key }) => ({
        url: '/confirm',
        method: 'POST',
        body,
        headers: {
          'Idempotency-Key': idempotency_key,
        },
      }),
    }),
  }),
});

export const { useCreateDraftRequestMutation } = confirmationApi;
