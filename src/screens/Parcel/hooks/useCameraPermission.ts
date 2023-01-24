import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  check, request, PERMISSIONS, RESULTS,
} from 'react-native-permissions';

const getCameraPermission = async () => {
  try {
    let granted = false;
    if (Platform.OS === 'ios') {
      let result = await check(PERMISSIONS.IOS.CAMERA);
      granted = result === RESULTS.GRANTED;
      if (!granted) {
        result = await request(PERMISSIONS.IOS.CAMERA);
        granted = result === RESULTS.GRANTED;
      }
    } else if (Platform.OS === 'android') {
      let result = await check(PERMISSIONS.ANDROID.CAMERA);
      granted = result === RESULTS.GRANTED;
      if (!granted) {
        result = await request(PERMISSIONS.ANDROID.CAMERA);
        granted = result === RESULTS.GRANTED;
      }
    }
    return granted;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const useCameraPermission = () => {
  const [hasCameraPermission, setCameraPermission] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const granted = await getCameraPermission();
      setCameraPermission(granted);
    };

    init();
  }, []);

  return {
    hasCameraPermission,
  };
};

export default useCameraPermission;
