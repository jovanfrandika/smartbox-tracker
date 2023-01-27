import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import {
  RefreshControl, ScrollView, View,
} from 'react-native';
import {
  Button, Snackbar, Text,
} from 'react-native-paper';
import MapView, { Circle, Marker } from 'react-native-maps';

import { Parcel, ParcelStatusEnum } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useOpenDoorMutation, useUpdateProgressMutation } from '../../../services/parcel';
import styles from './styles';
import useGetLocation from '../../../hooks/useGetLocation';
import CameraModal from '../components/CameraModal';
import { getCrowInMeters } from '../utils';
import { statusColor } from '../../../constants';
import useInterval from '../../../hooks/useInterval';
import ParcelInfo from '../components/ParcelInfo';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
};

const initialError = '';
const distanceRadius = 50;

const WaitingForCourier = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  if (parcel.receiver?.id === user?.id || parcel.sender?.id === user?.id) {
    useInterval({ cb: refetch, delay: 5000 });
    return (
      <ScrollView
        style={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isGetParcelLoading}
            onRefresh={() => {
              refetch();
            }}
          />
        )}
      >
        <ParcelInfo
          id={parcel.id}
          name={parcel.name}
          description={parcel.description}
          pickUpCoor={parcel.pickUpCoor}
          arrivedCoor={parcel.arrivedCoor}
          pickUpPhoto={parcel.pickUpPhoto}
          arrivedPhoto={parcel.arrivedPhoto}
          tempThr={parcel.tempThr}
          hmdThr={parcel.hmdThr}
          sender={parcel.sender}
          receiver={parcel.receiver}
          courier={parcel.courier}
          device={parcel.device}
          status={parcel.status}
          parcelTravels={[]}
        />
        <Text
          variant="titleMedium"
          style={[styles.textCenter, styles.spaceBottom]}
        >
          {parcel.pickUpPhoto === null ? 'Menunggu kurir ke pick up' : 'Menunggu kurir untuk memulai perjalanan'}
        </Text>
      </ScrollView>
    );
  }

  const [triggerOpenDoor, { isLoading: isOpenDoorLoading }] = useOpenDoorMutation({});
  const [
    triggerUpdateProgress,
    { isLoading: isUpdateProgressLoading },
  ] = useUpdateProgressMutation({});

  const [error, setError] = useState(initialError);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { userLocation } = useGetLocation();

  const mapRef = useRef<MapView | null>(null);

  const onPressOrder = useCallback(async () => {
    const res = await triggerUpdateProgress({ id: parcel.id });
    if ('data' in res) {
      refetch();
    } else {
      setError('Network problem');
    }
  }, []);

  const hasReachedEnd = useMemo(() => {
    if (!userLocation || !parcel.pickUpCoor) {
      return false;
    }
    return getCrowInMeters(userLocation, parcel.pickUpCoor) < distanceRadius;
  }, [userLocation, parcel]);

  const isLoading = isOpenDoorLoading || isUpdateProgressLoading || isGetParcelLoading;
  const isDisabled = isLoading || !hasReachedEnd;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      stickyHeaderIndices={[5]}
      invertStickyHeaders
      refreshControl={(
        <RefreshControl
          refreshing={isGetParcelLoading}
          onRefresh={() => {
            refetch();
          }}
        />
      )}
    >
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
      <CameraModal
        hasCameraPermission
        parcelId={parcel.id}
        status={ParcelStatusEnum.PickUp}
        isOpen={isCameraOpen}
        onHideModal={() => setIsCameraOpen(false)}
        setData={() => {}}
      />
      <MapView
        ref={(ref) => {
          mapRef.current = ref as MapView;
        }}
        style={[styles.map, styles.spaceBottom]}
        onMapReady={() => {
          mapRef.current?.animateToRegion({
            latitude: (parcel.pickUpCoor!.lat + parcel.arrivedCoor!.lat) / 2,
            longitude: (parcel.pickUpCoor!.lng + parcel.arrivedCoor!.lng) / 2,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        }}
      >
        {userLocation ? (
          <Marker
            title="Your location"
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
          />
        ) : null}
        <Circle
          center={{ latitude: parcel.pickUpCoor!.lat, longitude: parcel.pickUpCoor!.lng }}
          radius={distanceRadius}
          strokeWidth={2}
          strokeColor={statusColor[ParcelStatusEnum.PickUp]}
          fillColor={statusColor[ParcelStatusEnum.PickUp]}
          style={styles.mapCircle}
        />
        <Marker
          title="Pick Up"
          pinColor={statusColor[ParcelStatusEnum.PickUp]}
          coordinate={{
            latitude: parcel.pickUpCoor!.lat,
            longitude: parcel.pickUpCoor!.lng,
          }}
        />
        <Marker
          title="Destination"
          pinColor={statusColor[ParcelStatusEnum.Arrived]}
          coordinate={{
            latitude: parcel.arrivedCoor!.lat,
            longitude: parcel.arrivedCoor!.lng,
          }}
        />
      </MapView>
      <ParcelInfo
        id={parcel.id}
        name={parcel.name}
        description={parcel.description}
        pickUpCoor={parcel.pickUpCoor}
        arrivedCoor={parcel.arrivedCoor}
        pickUpPhoto={parcel.pickUpPhoto}
        arrivedPhoto={parcel.arrivedPhoto}
        tempThr={parcel.tempThr}
        hmdThr={parcel.hmdThr}
        sender={parcel.sender}
        receiver={parcel.receiver}
        courier={parcel.courier}
        device={parcel.device}
        status={parcel.status}
        parcelTravels={[]}
      />
      <View style={[styles.sticky, styles.spaceBottom]}>
        <Button
          mode="contained-tonal"
          onPress={() => setIsCameraOpen(true)}
          disabled={isDisabled}
          style={styles.spaceBottom}
        >
          Open Camera
        </Button>
        <View style={[styles.row, styles.spaceBottom]}>
          <Button
            onPress={() => triggerOpenDoor({ id: parcel.id })}
            disabled={isDisabled}
            style={styles.rowItem}
          >
            Open Door
          </Button>
          <Button
            mode="contained"
            onPress={onPressOrder}
            disabled={isDisabled}
            style={styles.rowItem}
          >
            Start delivery
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default WaitingForCourier;
