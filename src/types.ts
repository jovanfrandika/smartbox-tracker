export type Position = {
  lat: number;
  lng: number;
}

export type DeviceDatum = {
  coordinate: {
    lat: number;
    lng: number;
    speed: number;
    satellites: number;
  }
  temperature: number | null;
  humidity: number | null;
  signal: number;
  isDoorOpen: boolean;
  timestamp: string;
};

export enum DeviceModeEnum {
  Idle = 0,
  Active = 1,
}

export type DeviceStatus = {
  mode: DeviceModeEnum;
  endPosition: Position | null;
  logInterval: number | null;
};

export type RootStackParamList = {
  Home: undefined;
  Device: {
    brokerUrl: string,
    deviceName: string,
  };
};
