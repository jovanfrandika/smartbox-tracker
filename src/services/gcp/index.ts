import RNFetchBlob from 'rn-fetch-blob';

import { createApi } from '@reduxjs/toolkit/query/react';

import rnFetchBlobBaseQuery from '../../utils/rnFetchBlobBaseQuery';

type PutPhotoNameArgs = {
  url: string,
  photoPath: string,
};

type PutPhotoResponse = {};

export const deviceApi = createApi({
  reducerPath: 'deviceApi',
  tagTypes: ['Device'],
  baseQuery: rnFetchBlobBaseQuery({
    baseUrl: 'https://storage.googleapis.com/smartbox/',
    prepareHeaders: (headers: any = {}) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    putPhoto: builder.mutation<PutPhotoResponse, PutPhotoNameArgs>({
      query: ({ url, photoPath }) => ({
        url,
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        data: RNFetchBlob.wrap(photoPath),
      }),
    }),
  }),
});

export const {
  usePutPhotoMutation,
} = deviceApi;
