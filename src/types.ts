export type Coordinate = {
  lat: number;
  lng: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: number;
};

export type Friendship = {
  id: string;
  user: User;
  friend: User;
};

export type Device = {
  id: string;
  name: string;
  status: number;
};

export enum DeviceStatusEnum {
  Idle = 0,
  Active = 1,
}

export type DeviceStatus = {
  status: DeviceStatusEnum;
  logInterval: number | null;
};

export type DeviceCoordinate = {
  lat: number;
  lng: number;
  speed: number;
  satellites: number;
};

export type CoordinateTempHumid = {
  lat: number;
  long: number;
  temp: number;
  humid: number;
};

export enum ParcelStatusEnum {
  Draft = 0,
  WaitingForCourier = 1,
  PickUp = 2,
  OnGoing = 3,
  Arrived = 4,
  Done = 5,
}

export type Parcel = {
  id: string;
  name: string;
  description: string;
  photoUri: string;
  isPhotoValid: string;
  start: CoordinateTempHumid | null;
  end: CoordinateTempHumid | null;
  receiver: User | null;
  sender: User | null;
  courier: User | null;
  device: Device | null;
  status: ParcelStatusEnum;
};

export type ParcelTravel = {
  id: string;
  parcelId: string;
  coordinate: DeviceCoordinate;
  temp: number | null;
  humid: number | null;
  isDoorOpen: number;
  signal: number;
  gpsTimestamp: string;
  timestamp: string;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Parcel: {
    parcelId: string,
  };
};
