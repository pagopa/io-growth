import { baseApi } from '../../core/api/baseApi';
import type { CreateWebsitePayload, Website } from './types';

export const websiteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWebsites: builder.query<Website[], void>({
      query: () => '/websites',
      providesTags: ['Websites'],
    }),
    createWebsite: builder.mutation<Website, CreateWebsitePayload>({
      query: (body) => ({
        url: '/websites',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Websites'],
    }),
    deleteWebsite: builder.mutation<void, string>({
      query: (id) => ({
        url: `/websites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Websites'],
    }),
  }),
});

export const {
  useGetWebsitesQuery,
  useCreateWebsiteMutation,
  useDeleteWebsiteMutation,
} = websiteApi;
