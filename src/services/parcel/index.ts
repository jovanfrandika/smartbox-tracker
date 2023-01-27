import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import {
  Coordinate,
  Parcel,
  RawParcel,
  ParcelStatusEnum,
} from '../../types';

type GetHistoriesArgs = {};

type GetHistoriesResponse = {
  histories: Record<string, Parcel>;
};

type GetNearbyPickUpsArgs = {
  userLoc: Coordinate,
};

type GetNearbyPickUpsResponse = {
  parcels: Record<string, Parcel>;
};

type GetOneArgs = {
  id: string;
};

type GetOneResponse = Parcel;

type CreateOneArgs = {
  senderId: string;
};

type CreateOneResponse = {};

type UpdateOneArgs = RawParcel;

type UpdateOneResponse = {};

type GetPhotoSignedUrlArgs = {
  id: string,
  status: ParcelStatusEnum.PickUp | ParcelStatusEnum.Arrived,
};

type GetPhotoSignedUrlResponse = {
  url: string,
};

type CheckPhotoArgs = {
  id: string,
  status: ParcelStatusEnum.PickUp | ParcelStatusEnum.Arrived,
};

type CheckPhotoResponse = {};

type SendParcelCodeArgs = {
  id: string,
  toUserId: string,
}

type SendParcelCodeResponse = {}

type VerifyParcelCodeArgs = {
  id: string,
  code: string,
};

type VerifyParcelCodeResponse = {}

type UpdateProgressArgs = {
  id: string,
}

type UpdateProgressResponse = Parcel;

type OpenDoorArgs = {
  id: string,
}

type OpenDoorResponse = {}

type CloseDoorArgs = {
  id: string,
}

type CloseDoorResponse = {}

export const parcelApi = createApi({
  reducerPath: 'parcelApi',
  tagTypes: ['Parcel'],
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://smartbox.frandika.com/parcel',
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
        histories: res.histories.reduce((acc: Record<string, Parcel>, cur: any) => ({
          ...acc,
          [cur.id]: {
            id: cur.id,
            name: cur.name,
            description: cur.description,
            pickUpCoor: cur.pick_up_coor,
            arrivedCoor: cur.arrived_coor,
            pickUpPhoto: cur.pick_up_photo ? {
              uri: cur.pick_up_photo.uri,
              updateAt: cur.pick_up_photo.updated_at,
            } : null,
            arrivedPhoto: cur.arrived_photo ? {
              uri: cur.arrived_photo.uri,
              updateAt: cur.arrived_photo.updated_at,
            } : null,
            tempThr: cur.temp_thr,
            hmdThr: cur.hmd_thr,
            receiver: cur.receiver,
            sender: cur.sender,
            courier: cur.courier,
            device: cur.device,
            status: cur.status,
          },
        }), {}),
      }),
      providesTags: (res) => (res ? [...Object.keys(res.histories).map((id) => ({ type: 'Parcel' as const, id })), 'Parcel'] : ['Parcel']),
    }),
    getNearbyPickUps: builder.query<GetNearbyPickUpsResponse, GetNearbyPickUpsArgs>({
      query: ({ userLoc }) => ({
        url: `/pick-ups?lat=${userLoc.lat}&lng=${userLoc.lng}`,
      }),
      transformResponse: (res) => ({
        parcels: res.parcels.reduce((acc: Record<string, Parcel>, cur: any) => ({
          ...acc,
          [cur.id]: {
            id: cur.id,
            name: cur.name,
            description: cur.description,
            pickUpCoor: cur.pick_up_coor,
            arrivedCoor: cur.arrived_coor,
            pickUpPhoto: cur.pick_up_photo ? {
              uri: cur.pick_up_photo.uri,
              updatedAt: cur.pick_up_photo.update_at,
            } : null,
            arrivedPhoto: cur.arrived_photo ? {
              uri: cur.arrived_photo.uri,
              updatedAt: cur.arrived_photo.update_at,
            } : null,
            tempThr: cur.temp_thr,
            hmdThr: cur.hmd_thr,
            receiver: cur.receiver,
            sender: cur.sender,
            courier: cur.courier,
            device: cur.device,
            status: cur.status,
          },
        }), {}),
      }),
      providesTags: (res) => (res ? [...Object.keys(res.parcels).map((id) => ({ type: 'Parcel' as const, id })), 'Parcel'] : ['Parcel']),
    }),
    getOne: builder.query<GetOneResponse, GetOneArgs>({
      query: ({ id }) => ({
        url: `/one/${id}`,
      }),
      transformResponse: (res: any) => ({
        id: res.id,
        name: res.name,
        description: res.description,
        pickUpCoor: res.pick_up_coor,
        arrivedCoor: res.arrived_coor,
        pickUpPhoto: res.pick_up_photo ? {
          uri: res.pick_up_photo.uri,
          updatedAt: res.pick_up_photo.updated_at,
        } : null,
        arrivedPhoto: res.arrived_photo ? {
          uri: res.arrived_photo.uri,
          updatedAt: res.arrived_photo.updated_at,
        } : null,
        tempThr: res.temp_thr,
        hmdThr: res.hmd_thr,
        receiver: res.receiver,
        sender: res.sender,
        courier: res.courier,
        device: res.device,
        status: res.status,
      }),
      providesTags: (res) => (res ? [{ type: 'Parcel' as const, id: res.id }] : ['Parcel']),
    }),
    createOne: builder.mutation<CreateOneResponse, CreateOneArgs>({
      query: ({ senderId }) => ({
        url: '/',
        method: 'POST',
        data: {
          sender_id: senderId,
        },
      }),
      invalidatesTags: () => (['Parcel']),
    }),
    updateOne: builder.mutation<UpdateOneResponse, UpdateOneArgs>({
      query: (parcel) => ({
        url: '/',
        method: 'PUT',
        data: {
          id: parcel.id,
          name: parcel.name,
          description: parcel.description,
          pick_up_coor: parcel.pickUpCoor,
          arrived_coor: parcel.arrivedCoor,
          pick_up_photo: parcel.pickUpPhoto ? ({
            updated_at: parcel.pickUpPhoto.updatedAt,
          }) : null,
          arrived_photo: parcel.arrivedPhoto ? ({
            updated_at: parcel.arrivedPhoto.updatedAt,
          }) : null,
          temp_thr: parcel.tempThr,
          hmd_thr: parcel.hmdThr,
          receiver_id: parcel.receiverId,
          sender_id: parcel.senderId,
          courier_id: parcel.courierId,
          device_id: parcel.deviceId,
          status: parcel.status,
        },
      }),
      invalidatesTags: () => (['Parcel']),
    }),
    getPhotoSignedUrl: builder.mutation<GetPhotoSignedUrlResponse, GetPhotoSignedUrlArgs>({
      query: ({ id, status }) => ({
        url: '/photo/url',
        method: 'POST',
        data: {
          id,
          status,
        },
      }),
    }),
    checkPhoto: builder.mutation<CheckPhotoResponse, CheckPhotoArgs>({
      query: ({ id, status }) => ({
        url: '/photo/check',
        method: 'POST',
        data: {
          id,
          status,
        },
      }),
      invalidatesTags: () => (['Parcel']),
    }),
    sendParcelCode: builder.mutation<
      SendParcelCodeResponse,
      SendParcelCodeArgs
    >({
      query: ({ id, toUserId }) => ({
        url: '/code/send',
        method: 'POST',
        data: {
          id,
          to_user_id: toUserId,
        },
      }),
    }),
    verifyParcelCode: builder.mutation<VerifyParcelCodeResponse, VerifyParcelCodeArgs>({
      query: ({ id, code }) => ({
        url: '/code/verify',
        method: 'POST',
        data: {
          id,
          code,
        },
      }),
      invalidatesTags: () => (['Parcel']),
    }),
    updateProgress: builder.mutation<UpdateProgressResponse, UpdateProgressArgs>({
      query: ({ id }) => ({
        url: '/progress',
        method: 'POST',
        data: {
          id,
        },
      }),
      transformResponse: (res: any) => ({
        id: res.id,
        name: res.name,
        description: res.description,
        pickUpCoor: res.pick_up_coor,
        arrivedCoor: res.arrived_coor,
        pickUpPhoto: res.pick_up_photo ? {
          uri: res.pick_up_photo.uri,
          updatedAt: res.pick_up_photo.updated_at,
        } : null,
        arrivedPhoto: res.arrived_photo ? {
          uri: res.arrived_photo.uri,
          updatedAt: res.arrived_photo.updated_at,
        } : null,
        tempThr: res.temp_thr,
        hmdThr: res.hmd_thr,
        receiver: res.receiver,
        sender: res.sender,
        courier: res.courier,
        device: res.device,
        status: res.status,
      }),
      invalidatesTags: () => (['Parcel']),
    }),
    openDoor: builder.mutation<OpenDoorResponse, OpenDoorArgs>({
      query: ({ id }) => ({
        url: '/open',
        method: 'POST',
        data: {
          id,
        },
      }),
    }),
    closeDoor: builder.mutation<CloseDoorResponse, CloseDoorArgs>({
      query: ({ id }) => ({
        url: '/close',
        method: 'POST',
        data: {
          id,
        },
      }),
    }),
  }),
});

export const {
  useGetHistoriesQuery,
  useLazyGetNearbyPickUpsQuery,
  useGetOneQuery,
  useCreateOneMutation,
  useUpdateOneMutation,
  useGetPhotoSignedUrlMutation,
  useCheckPhotoMutation,
  useSendParcelCodeMutation,
  useVerifyParcelCodeMutation,
  useUpdateProgressMutation,
  useOpenDoorMutation,
  useCloseDoorMutation,
} = parcelApi;
