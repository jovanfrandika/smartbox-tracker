import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { ParcelTravel } from '../../types';

type GetAllArgs = {
  parcelId: string;
};

type GetAllResponse = {
  parcelTravels: ParcelTravel[];
};

export const parcelTravelApi = createApi({
  reducerPath: 'parcelTravelApi',
  tagTypes: ['ParcelTravel'],
  baseQuery: axiosBaseQuery({
    baseUrl: 'https://smartbox.frandika.com/parcel_travel',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';
      newHeaders.Authorization = `Bearer ${getAccessToken()}`;

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    getAll: builder.query<GetAllResponse, GetAllArgs>({
      query: ({ parcelId }) => ({
        url: `/?parcel_id=${parcelId}`,
      }),
      transformResponse: (res) => ({
        parcelTravels: res?.parcel_travels ? res?.parcel_travels.map((cur: any) => (
          {
            id: cur.id,
            parcelId: cur.parcel_id,
            coor: cur.coor,
            temp: cur.temp,
            hmd: cur.hmd,
            doorStatus: cur.door_status,
            sgnl: cur.sgnl,
            spd: cur.spd,
            stls: cur.stls,
            gpsTs: cur.gps_ts,
            ts: cur.ts,
          }
        )) : [],
      }),
    }),
  }),
});

export const {
  useGetAllQuery,
} = parcelTravelApi;
