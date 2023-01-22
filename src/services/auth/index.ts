import { AxiosRequestHeaders } from 'axios';

import { createApi } from '@reduxjs/toolkit/query/react';

import axiosBaseQuery from '../../utils/axiosBaseQuery';

import { getAccessToken } from '../../utils/token';

import { User } from '../../types';
import { setIsLogin, setUser } from '../../stores/auth';

type MeArgs = {};

type MeResponse = User;

type LoginArgs = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

type RegisterArgs = {
  name: string;
  email: string;
  password: string;
  role: number;
};

type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['User'],
  baseQuery: axiosBaseQuery({
    baseUrl: '/user',
    prepareHeaders: (headers: any = {}) => {
      const newHeaders: AxiosRequestHeaders = { ...headers };

      newHeaders['Content-type'] = 'application/json';

      return newHeaders;
    },
  }),
  endpoints: (builder) => ({
    me: builder.query<MeResponse, MeArgs>({
      query: () => ({
        url: '/me',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      }),
      async onQueryStarted(
        _,
        {
          dispatch,
          queryFulfilled,
        },
      ) {
        const res = await queryFulfilled;
        if ('data' in res) {
          const user = res.data!;
          dispatch(setUser({ user }));
        } else {
          dispatch(setIsLogin({ isLogin: false }));
        }
      },
    }),
    login: builder.mutation<LoginResponse, LoginArgs>({
      query: ({ email, password }) => ({
        url: '/login',
        method: 'POST',
        data: { email, password },
      }),
      transformResponse: (res) => ({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterArgs>({
      query: ({
        name,
        email,
        password,
        role,
      }) => ({
        url: '/register',
        method: 'POST',
        data: {
          name,
          email,
          password,
          role,
        },
      }),
      transformResponse: (res) => ({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
      }),
    }),
  }),
});

export const {
  useLazyMeQuery,
  useLoginMutation,
  useRegisterMutation,
} = authApi;
