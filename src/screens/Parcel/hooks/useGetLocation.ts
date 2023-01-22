import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  check, request, PERMISSIONS, RESULTS,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

import { Coordinate } from '../../../types';

const getLocationPermission = async () => {
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

const useGetLocation = () => {
  const [userLocation, setUserLocation] = useState<Coordinate>();
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);

  const geoWatcherRef = useRef<number>();

  useEffect(() => {
    const init = async () => {
      const granted = await getLocationPermission();
      setHasLocationPermission(granted);
    };

    init();

    return () => {
      if (geoWatcherRef.current !== undefined) { Geolocation.clearWatch(geoWatcherRef.current); }
    };
  }, []);

  useEffect(() => {
    if (hasLocationPermission) {
      geoWatcherRef.current = Geolocation.watchPosition((position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, (err) => {
        console.warn(err.code, err.message);
      });
    }
  }, [hasLocationPermission]);

  return {
    userLocation,
  };
};

export default useGetLocation;
