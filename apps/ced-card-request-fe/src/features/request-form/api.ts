import { baseApi } from '../../core/api/baseApi';
import {
  DraftDataResponse,
  NuovaDomandaInBozzaRequest,
} from '../../core/api/generated/model';

type createDraftRequest = {
  body: NuovaDomandaInBozzaRequest;
  idempotency_key: string;
};

export const requestFormApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDraftRequest: builder.mutation<DraftDataResponse, createDraftRequest>(
      {
        query: ({ body, idempotency_key }) => ({
          url: '/request',
          method: 'POST',
          body,
          headers: {
            'Idempotency-Key': idempotency_key,
          },
        }),
      },
    ),
  }),
});

export const { useCreateDraftRequestMutation } = requestFormApi;
