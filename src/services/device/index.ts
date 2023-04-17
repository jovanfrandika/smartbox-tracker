import { AxiosRequestHeaders, responseEncoding } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { Device } from '../../types';

type GetOneArgs = {
  id: string,
};

type GetOneResponse = Device;

export const deviceApi = createApi({
  reducerPath: 'deviceApi',
  tagTypes: ['Device'],
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://smartbox.frandika.com/device',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';
      newHeaders.Authorization = `Bearer ${getAccessToken()}`;

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    getOne: builder.query<GetOneResponse, GetOneArgs>({
      query: ({ id }) => ({
        url: `/one/${id}`,
      }),
      transformResponse: (res: any) => ({
        id: res.id,
        name: res.name,
        status: res.status,
        logInterval: res.interval,
      }),
    }),
  }),
});

export const {
  useLazyGetOneQuery,
} = deviceApi;
