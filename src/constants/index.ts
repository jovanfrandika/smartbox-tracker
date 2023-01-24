import { CameraDeviceFormat } from 'react-native-vision-camera';
import { ParcelStatusEnum, UserRoleEnum } from '../types';

export const emptyId = '000000000000000000000000';

export const buildCameraFormat = (cameraSize: number): CameraDeviceFormat => ({
  photoHeight: cameraSize,
  photoWidth: cameraSize,
  videoHeight: cameraSize,
  videoWidth: cameraSize,
  minISO: 25,
  maxISO: 1600,
  fieldOfView: 73.81222877530534,
  pixelFormat: '420v',
  supportsPhotoHDR: false,
  supportsVideoHDR: false,
  isHighestPhotoQualitySupported: false,
  colorSpaces: ['raw'],
  frameRateRanges: [
    { maxFrameRate: 30, minFrameRate: 1 },
    { maxFrameRate: 30, minFrameRate: 30 },
  ],
  autoFocusSystem: 'none',
  maxZoom: 8,
  videoStabilizationModes: ['off'],
});

export const userRoleEnumToString = (role: UserRoleEnum): string => {
  switch (role) {
    case UserRoleEnum.Customer:
      return 'Customer';
    case UserRoleEnum.Courier:
      return 'Courier';
    default:
      return '';
  }
};

export const parcelStatusEnumToString = (status: ParcelStatusEnum): string => {
  switch (status) {
    case ParcelStatusEnum.Draft:
      return 'Draft';
    case ParcelStatusEnum.WaitingForCourier:
      return 'Waiting For Courier';
    case ParcelStatusEnum.PickUp:
      return 'Pick Up';
    case ParcelStatusEnum.OnGoing:
      return 'On Going';
    case ParcelStatusEnum.Arrived:
      return 'Arrived';
    case ParcelStatusEnum.Done:
      return 'Done';
    default:
      return '';
  }
};

export const screens = {
  login: 'Login' as 'Login',
  register: 'Register' as 'Register',
  home: 'Home' as 'Home',
  parcel: 'Parcel' as 'Parcel',
};

export default {
  screens,
};
