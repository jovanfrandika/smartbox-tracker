import { useEffect, useState, useRef, useMemo, Fragment, useCallback } from "react";
import MapView, { Circle, Marker } from "react-native-maps";
import { Button, TextInput, Snackbar, Text, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import Geolocation from 'react-native-geolocation-service';
import { useNavigation, useRoute } from "@react-navigation/native";

import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Position, DeviceDatum, DeviceStatus, DeviceModeEnum } from '../../types';

import { getLocationPermission } from "./permission";
import {
  connect,
  disconnect,
  publish,
} from './mqtt';

import { filterNumber, getCrowInMeters } from './utils'; 

import styles from './styles';

type DeviceScreenRouteProp = RouteProp<RootStackParamList, 'Device'>;

const radius = 20;

const initialError = '';
const publishError = 'Something went wrong!';
const publishStartWithNoEndPositionError = 'No end position!';

const Device = () => {
  const navigation = useNavigation();
  const route = useRoute<DeviceScreenRouteProp>();

  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [isOnTheWay, setIsOnTheWay] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [hasDeviceStatus, setHasDeviceStatus] = useState<boolean>(false);
  const [error, setError] = useState<string>(initialError);

  const [deviceData, setDeviceData] = useState<DeviceDatum[]>([]);
  const [userPosition, setUserPosition] = useState<Position>();
  const [endPosition, setEndPosition] = useState<Position>();
  const [logInterval, setLogInterval] = useState<string>("60"); // in seconds
  const [openDoorDuration, setOpenDoorDuration] = useState<string>("5"); // in seconds
  
  const mapRef = useRef<MapView>();
  const geoWatcherRef = useRef<number>();

  const hasReachEndPosition = useMemo(() => {
    if (deviceData.length === 0 || !endPosition) {
      return false;
    }
    const lastDeviceDatum = deviceData[deviceData.length - 1];
    const lastDevicePosition: Position = { lat: lastDeviceDatum.coordinate.lat, lng: lastDeviceDatum.coordinate.lng };
    const distance = getCrowInMeters(lastDevicePosition, endPosition) * 1000;
    return distance <= radius;
  }, [deviceData, endPosition]);

  const endMarker = useMemo(() => {
    if (!endPosition) {
      return <Fragment />
    }
    return (
      <Fragment>
        <Marker
          draggable={!isOnTheWay}
          title="End Point"
          pinColor="#80bfff"
          coordinate={{ latitude: endPosition.lat, longitude: endPosition.lng }}
          onDragEnd={(e) => setEndPosition({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
        />
        <Circle
          center={{ latitude: endPosition.lat, longitude: endPosition.lng }}
          radius={radius}
          strokeWidth={2}
          strokeColor="#3399ff"
          fillColor="#80bfff"
        />
      </Fragment>
    )
  }, [endPosition, setEndPosition, isOnTheWay]);

  const onPressUpdateLogInterval = useCallback(() => {
    publish(JSON.stringify({ cmd: 'time', value: +logInterval }), () => setError(publishError));
  }, [logInterval]);

  const onPressOpenDoor = useCallback(() => {
    publish(JSON.stringify({ cmd: 'door', value: +openDoorDuration }), () => setError(publishError));
  }, [openDoorDuration]);

  const onPressStart = useCallback(() => {
    if (!endPosition) {
      return setError(publishStartWithNoEndPositionError);
    }
    if (!isOnTheWay && endPosition) {
      publish(JSON.stringify({ cmd: 'start', value: {...endPosition} }), () => setError(publishError));
      setDeviceData([]);
      setIsOnTheWay(true);
    }
  }, [connect, publish, isOnTheWay, endPosition]);

  const onPressEnd = useCallback(() => {
    if (hasReachEndPosition) {
      publish(JSON.stringify({ cmd: 'end' }), () => setError(publishError));
      setIsOnTheWay(false);
    }
  }, [connect, hasReachEndPosition]);

  const onPressClear = useCallback(() => {
    setDeviceData([]);
    if (userPosition) { setEndPosition(userPosition); }
  }, [userPosition]);

  const markers = useMemo(() => deviceData.map((deviceDatum, idx) => (
    <Marker
      key={`${idx}-${deviceDatum.coordinate.lat}-${deviceDatum.coordinate.lng}`}
      title={`${idx + 1}`}
      coordinate={{ latitude: deviceDatum.coordinate.lat, longitude: deviceDatum.coordinate.lng }}
    />
  )), [deviceData]);

  useEffect(() => {
    const init = async () => {
      const granted = await getLocationPermission();
      setHasLocationPermission(granted);
      connect(
        route.params.brokerUrl,
        route.params.deviceName,
        () => setIsConnected(true),
        () => setIsConnected(false),
        (msg: Buffer) => {
          try {
            const deviceDatum = JSON.parse(msg.toString()) as DeviceDatum;
            setDeviceData((prev) => [...prev, deviceDatum])
          } catch (err) {
            console.warn(err);
          }
        },
        (msg: Buffer) => {
          try {
            const deviceStatus = JSON.parse(msg.toString()) as DeviceStatus;
            console.log(deviceStatus);
            if (deviceStatus.logInterval) {
              setLogInterval(deviceStatus.logInterval.toString());
            }
            if (deviceStatus.endPosition && deviceStatus.mode === DeviceModeEnum.Active) {
              setEndPosition(deviceStatus.endPosition);
            }
            setIsOnTheWay(deviceStatus.mode === DeviceModeEnum.Active);
            setHasDeviceStatus(true);
          } catch (err) {
            console.warn(err);
          }
        },
      );
    };

    init();

    return () => {
      if (geoWatcherRef.current !== undefined) { Geolocation.clearWatch(geoWatcherRef.current); }
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (hasLocationPermission) {
      geoWatcherRef.current = Geolocation.watchPosition((position) => {
        setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude })

        mapRef.current?.animateToRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0025,
          longitudeDelta: 0.0025,
        }, 1000);
      }, (err) => {
        console.warn(err.code, err.message);
      });
    }
  }, [hasLocationPermission]);

  useEffect(() => {
    if (isConnected) {
      publish(JSON.stringify({ cmd: 'status' }), () => setError(publishError));
    }
  }, [isConnected]);

  useEffect(() => {
    if (userPosition !== undefined) { setEndPosition(userPosition); }
  }, [userPosition]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Button
          onPress={navigation.goBack}
          style={styles.headerBack}
          disabled={isOnTheWay}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Smartbox {route.params.deviceName}
        </Text>
        <Text variant="titleMedium" style={[isConnected ? styles.headerConnectedStatus : styles.headerDisconnectedStatus]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
      <MapView 
        ref={(map: MapView) => { mapRef.current = map; }}
        showsUserLocation={hasLocationPermission}
        style={styles.map}
      >
        {endMarker}
        {markers}
      </MapView>
      <ScrollView style={styles.scrollContainer}>
        <View>
          <TextInput
            label="Log Interval (s)"
            value={logInterval}
            mode="outlined"
            onChangeText={(newVal: string) => setLogInterval(filterNumber(newVal))}
            style={styles.spaceBottom}
            disabled={!hasDeviceStatus}
          />
          <Button mode="contained" onPress={onPressUpdateLogInterval} style={styles.spaceBottom} disabled={!isConnected || !hasDeviceStatus || +logInterval <= 0}>
            Update Log Interval
          </Button>
        </View>
        <Divider bold style={styles.spaceBottom}/>
        <View>
          <TextInput
            label="Open Door (s)"
            value={openDoorDuration}
            mode="outlined"
            onChangeText={(newVal: string) => setOpenDoorDuration(filterNumber(newVal))}
            style={styles.spaceBottom}
            disabled={!hasDeviceStatus}
          />
          <Button mode="contained" onPress={onPressOpenDoor} style={styles.spaceBottom} disabled={!isConnected || !hasDeviceStatus || +openDoorDuration <= 0}>
            Open Door
          </Button>
        </View>
        <Divider bold style={styles.spaceBottom}/>
        <View style={styles.row}>
          <View style={styles.full}>
            <Button mode="contained-tonal" onPress={onPressClear} disabled={!isConnected || !hasDeviceStatus || isOnTheWay}>
              Clear
            </Button>
          </View>
          <View style={styles.extraSpace}/>
          <View style={styles.full}>
            {!isOnTheWay ? (
              <Button mode="contained" onPress={onPressStart} disabled={!isConnected || !hasDeviceStatus} style={styles.spaceBottom}>
                Start
              </Button>
            ) : (
              <Button mode="contained" onPress={onPressEnd} disabled={!isConnected || !hasDeviceStatus || !hasReachEndPosition} style={styles.spaceBottom}>
                End
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  )
};

export default Device;
