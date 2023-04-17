import { useMemo } from 'react';
import { CameraDevice, useCameraDevices } from 'react-native-vision-camera';

const useBackCamera = () => {
  const ultraDevices = useCameraDevices('ultra-wide-angle-camera');
  const devices = useCameraDevices('wide-angle-camera');

  const backDevice = useMemo<CameraDevice | null>(() => {
    if (ultraDevices.back) {
      return ultraDevices.back;
    }
    if (devices.back) {
      return devices.back;
    }
    return null;
  }, [devices, ultraDevices]);

  return {
    backDevice,
  };
};

export default useBackCamera;
