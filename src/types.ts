export type Maybe<T> = T | null;

export type Coordinate = {
  lat: number;
  lng: number;
};

export enum UserRoleEnum {
  Customer = 1,
  Courier = 2,
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRoleEnum;
};

export type Friend = {
  friendUserId: string;
  name: string;
  email: string;
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
  logInterval: number;
};

export type Threshold = {
  low: number;
  high: number;
}

export enum ParcelStatusEnum {
  Draft = 1,
  WaitingForCourier = 2,
  PickUp = 3,
  OnGoing = 4,
  Arrived = 5,
  Done = 6,
}

export type RawPhoto = {
  updatedAt: string;
}

export type Photo = RawPhoto & {
  uri: string;
}

export type RawParcel = {
  id: string;
  name: string;
  description: string;
  pickUpCoor: Maybe<Coordinate>;
  arrivedCoor: Maybe<Coordinate>;
  pickUpPhoto: Maybe<RawPhoto>;
  arrivedPhoto: Maybe<RawPhoto>;
  tempThr: Maybe<Threshold>;
  hmdThr: Maybe<Threshold>;
  receiverId: string;
  senderId: string;
  courierId: string;
  deviceId: string;
  status: ParcelStatusEnum;
};

export type Parcel = {
  id: string;
  name: string;
  description: string;
  pickUpCoor: Maybe<Coordinate>;
  arrivedCoor: Maybe<Coordinate>;
  pickUpPhoto: Maybe<Photo>;
  arrivedPhoto: Maybe<Photo>;
  tempThr: Maybe<Threshold>;
  hmdThr: Maybe<Threshold>;
  receiver: Maybe<User>;
  sender: Maybe<User>;
  courier: Maybe<User>;
  device: Maybe<Device>;
  status: ParcelStatusEnum;
};

export type ParcelTravel = {
  id: string;
  parcelId: string;
  coor: Coordinate;
  temp: number;
  hmd: number;
  doorStatus: number;
  sgnl: number;
  spd: number;
  stls: number;
  gpsTs: string;
  ts: string;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Parcel: { parcelId: string };
};
