import { AxiosRequestHeaders, responseEncoding } from 'axios';
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
    baseUrl: 'https://smartbox.frandika.com/device',
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
        url: `/name/${name}`,
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
  useLazyGetOneByNameQuery,
} = deviceApi;
