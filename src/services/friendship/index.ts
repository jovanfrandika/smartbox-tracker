import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { Friend } from '../../types';

type GetAllArgs = {};

type GetAllResponse = {
  friends: Friend[],
};

type CreateOneArgs = {
  friendUserId: string,
};

type CreateOneResponse = {};

export const friendshipApi = createApi({
  reducerPath: 'friendshipApi',
  tagTypes: ['Friendship'],
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://smartbox.frandika.com/friendship',
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
      transformResponse: (res: any) => ({
        friends: [...res.friends.map((friend: any) => ({
          friendUserId: friend.friend_user_id,
          name: friend.name,
          email: friend.email,
        }))],
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
