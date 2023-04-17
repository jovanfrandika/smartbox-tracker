import { authApi } from './auth';
import { deviceApi } from './device';
import { friendshipApi } from './friendship';
import { parcelApi } from './parcel';
import { parcelTravelApi } from './parcelTravel';

export const apiReducers = {
  [authApi.reducerPath]: authApi.reducer,
  [deviceApi.reducerPath]: deviceApi.reducer,
  [friendshipApi.reducerPath]: friendshipApi.reducer,
  [parcelApi.reducerPath]: parcelApi.reducer,
  [parcelTravelApi.reducerPath]: parcelTravelApi.reducer,
};

export const apiMiddlewares = [
  authApi.middleware,
  deviceApi.middleware,
  friendshipApi.middleware,
  parcelApi.middleware,
  parcelTravelApi.middleware,
];
