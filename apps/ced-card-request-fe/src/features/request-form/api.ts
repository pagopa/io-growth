import { baseApi } from '../../core/api/baseApi';
import {
  CreateNewApplication200,
  NuovaDomandaInBozzaRequest,
} from '../../core/api/generated/model';

type createDraftRequest = {
  body: NuovaDomandaInBozzaRequest;
  idempotency_key: string;
};

const requestFormApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDraftRequest: builder.mutation<
      CreateNewApplication200,
      createDraftRequest
    >({
      query: ({ body, idempotency_key }) => ({
        url: '/request',
        method: 'POST',
        body,
        headers: {
          'Idempotency-Key': idempotency_key,
        },
      }),
    }),
  }),
});

export const { useCreateDraftRequestMutation } = requestFormApi;
