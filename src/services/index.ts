import { authApi } from './auth';

export const apiReducers = {
  [authApi.reducerPath]: authApi.reducer,
};

export const apiMiddlewares = [authApi.middleware];
