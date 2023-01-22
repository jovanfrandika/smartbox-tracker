import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { Parcel } from '../../types';

type GetHistoriesArgs = {};

type GetHistoriesResponse = {
  parcels: Record<string, Parcel>;
};

type CreateOneArgs = {};

type CreateOneResponse = {};

type UpdateOneArgs = {};

type UpdateOneResponse = {};

type GetPhotoSignedUrlArgs = {
  id: string,
};

type GetPhotoSignedUrlResponse = {};

type CheckPhotoArgs = {
  id: string,
};

type CheckPhotoResponse = {}

type SendParcelCodeToReceiverArgs = {
  id: string,
}

type SendParcelCodeToReceiverResponse = {}

type VerifyParcelCodeArgs = {
  id: string,
  code: string,
}

type VerifyParcelCodeResponse = {}

type UpdateProgressArgs = {}

type UpdateProgressResponse = {}

type OpenDoorArgs = {}

type OpenDoorResponse = {}

export const parcelApi = createApi({
  reducerPath: 'parcelApi',
  tagTypes: ['Parcel'],
  baseQuery: axiosBaseQuery({
    baseUrl: '/parcel',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';
      newHeaders.Authorization = `Bearer ${getAccessToken()}`;

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    getHistories: builder.query<GetHistoriesResponse, GetHistoriesArgs>({
      query: () => ({
        url: '/',
      }),
      transformResponse: (res) => ({
        parcels: res.parcels.reduce((acc: Record<string, Parcel>, cur: any) => ({
          ...acc,
          [cur.id]: {
            id: cur.id,
            name: cur.name,
            description: cur.description,
            photoUri: cur.photo_uri,
            isPhotoValid: cur.is_photo_valid,
            start: cur.start,
            end: cur.end,
            receiver: cur.receiver,
            sender: cur.sender,
            courier: cur.courier,
            device: cur.device,
            status: cur.status,
          },
        })),
      }),
    }),
    createOne: builder.mutation<CreateOneResponse, CreateOneArgs>({
      query: () => ({
        url: '/',
        method: 'POST',
      }),
    }),
    updateOne: builder.mutation<UpdateOneResponse, UpdateOneArgs>({
      query: (parcel) => ({
        url: '/',
        method: 'PUT',
        data: parcel,
      }),
    }),
    getPhotoSignedUrl: builder.mutation<GetPhotoSignedUrlResponse, GetPhotoSignedUrlArgs>({
      query: ({ id }) => ({
        url: '/photo/url',
        method: 'POST',
        data: {
          id,
        },
      }),
    }),
    checkPhoto: builder.mutation<CheckPhotoResponse, CheckPhotoArgs>({
      query: ({ id }) => ({
        url: '/photo/check',
        method: 'POST',
        data: {
          id,
        },
      }),
    }),
    sendParcelCodeToReceiver: builder.mutation<
      SendParcelCodeToReceiverResponse,
      SendParcelCodeToReceiverArgs
    >({
      query: ({ id }) => ({
        url: '/code/send',
        method: 'POST',
        data: {
          id,
        },
      }),
    }),
    verifyParcelCode: builder.mutation<VerifyParcelCodeResponse, VerifyParcelCodeArgs>({
      query: ({ id, code }) => ({
        url: '/photo/verify',
        method: 'POST',
        data: {
          id,
          code,
        },
      }),
    }),
    updateProgress: builder.mutation<UpdateProgressResponse, UpdateProgressArgs>({
      query: () => ({
        url: '/progress',
        method: 'POST',
      }),
    }),
    openDoor: builder.mutation<OpenDoorResponse, OpenDoorArgs>({
      query: () => ({
        url: '/open',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetHistoriesQuery,
  useCreateOneMutation,
  useUpdateOneMutation,
  useGetPhotoSignedUrlMutation,
  useCheckPhotoMutation,
  useSendParcelCodeToReceiverMutation,
  useVerifyParcelCodeMutation,
  useUpdateProgressMutation,
  useOpenDoorMutation,
} = parcelApi;
