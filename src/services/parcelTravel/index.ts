import { AxiosRequestHeaders } from 'axios';
import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { ParcelTravel } from '../../types';

type GetAllArgs = {};

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
      query: () => ({
        url: '/',
      }),
      transformResponse: (res) => ({
        parcelTravels: res.parcels.map((cur: any) => (
          {
            id: cur.id,
            parcelId: cur.parcel_id,
            coordinate: cur.coordinate,
            temp: cur.temp,
            humid: cur.humid,
            is_door_open: cur.is_door_open,
            signal: cur.signal,
            gpsTimestamp: cur.gps_timestamp,
            timestamp: cur.timestamp,
          }
        )),
      }),
    }),
  }),
});

export const {
  useGetAllQuery,
} = parcelTravelApi;
