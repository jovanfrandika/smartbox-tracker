import { Platform } from 'react-native';
import {
  check, request, PERMISSIONS, RESULTS,
} from 'react-native-permissions';

export const getLocationPermission = async () => {
  try {
    let granted = false;
    if (Platform.OS === 'ios') {
      let result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      granted = result === RESULTS.GRANTED;
      if (!granted) {
        result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        granted = result === RESULTS.GRANTED;
      }
    } else if (Platform.OS === 'android') {
      let result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      granted = result === RESULTS.GRANTED;
      if (!granted) {
        result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        granted = result === RESULTS.GRANTED;
      }
    }
    return granted;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export default getLocationPermission;
