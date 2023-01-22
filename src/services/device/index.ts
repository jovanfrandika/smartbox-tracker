import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { Device } from '../../types';

type GetOneByNameArgs = {
  name: string,
};

type GetOneByNameResponse = Device;

export const deviceApi = createApi({
  reducerPath: 'deviceApi',
  tagTypes: ['Device'],
  baseQuery: axiosBaseQuery({
    baseUrl: '/device',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';
      newHeaders.Authorization = `Bearer ${getAccessToken()}`;

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    getOneByName: builder.query<GetOneByNameResponse, GetOneByNameArgs>({
      query: ({ name }) => ({
        url: `/${name}`,
      }),
    }),
  }),
});

export const {
  useLazyGetOneByNameQuery,
} = deviceApi;
