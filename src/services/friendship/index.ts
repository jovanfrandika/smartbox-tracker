import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { User } from '../../types';

type GetAllArgs = {};

type GetAllResponse = {
  friends: User[],
};

type CreateOneArgs = {
  friendUserId: string,
};

type CreateOneResponse = {};

export const friendshipApi = createApi({
  reducerPath: 'friendshipApi',
  tagTypes: ['Friendship'],
  baseQuery: axiosBaseQuery({
    baseUrl: '/friendship',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';
      newHeaders.Authorization = `Bearer ${getAccessToken()}`;

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    getAll: builder.query<GetAllResponse, GetAllArgs>({
      query: () => ({
        url: '/',
      }),
    }),
    createOne: builder.mutation<CreateOneResponse, CreateOneArgs>({
      query: ({ friendUserId }) => ({
        url: '/',
        method: 'POST',
        data: {
          friend_user_id: friendUserId,
        },
      }),
    }),
  }),
});

export const {
  useGetAllQuery,
  useCreateOneMutation,
} = friendshipApi;
