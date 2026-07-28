import { baseApi } from '../../core/api/baseApi';
import {
  ConfermaDomandaRequest,
  ConfirmApplication200,
} from '../../core/api/generated/model';

type ConfirmApplicationRequest = {
  body: ConfermaDomandaRequest;
  idempotency_key: string;
};

export const confirmationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    confirm: builder.mutation<ConfirmApplication200, ConfirmApplicationRequest>(
      {
        query: ({ body, idempotency_key }) => ({
          url: '/confirm',
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

export const { useConfirmMutation } = confirmationApi;
