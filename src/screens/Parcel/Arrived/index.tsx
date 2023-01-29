import {
  useCallback, useRef, useState,
} from 'react';
import {
  RefreshControl, ScrollView, View,
} from 'react-native';
import {
  Button, Snackbar,
} from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';

import { Parcel, ParcelStatusEnum } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useOpenDoorMutation, useUpdateProgressMutation } from '../../../services/parcel';
import styles from './styles';
import CameraModal from '../components/CameraModal';
import { statusColor } from '../../../constants';
import useInterval from '../../../hooks/useInterval';
import ParcelInfo from '../components/ParcelInfo';
import useCameraPermission from '../../../hooks/useCameraPermission';
import { useGetAllQuery } from '../../../services/parcelTravel';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
};

const initialError = '';

const Arrived = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  const [error, setError] = useState(initialError);

  const [triggerOpenDoor, { isLoading: isOpenDoorLoading }] = useOpenDoorMutation({});
  const [
    triggerUpdateProgress,
    { isLoading: isUpdateProgressLoading },
  ] = useUpdateProgressMutation({});

  const {
    data: parcelTravelData,
    isLoading: isGetParcelDataLoading,
  } = useGetAllQuery({ parcelId: parcel.id });

  const mapRef = useRef<MapView | null>(null);

  const onPressOrder = useCallback(async () => {
    const res = await triggerUpdateProgress({ id: parcel.id });
    if ('data' in res) {
      refetch();
    } else {
      setError('Network problem');
    }
  }, []);

  const isLoading = isOpenDoorLoading
    || isUpdateProgressLoading || isGetParcelLoading || isGetParcelDataLoading;
  const isDisabled = isLoading;

  if (parcel.receiver?.id === user?.id || parcel.sender?.id === user?.id) {
    useInterval({ cb: refetch, delay: 5000 });
    return (
      <>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={(
            <RefreshControl
              refreshing={isGetParcelLoading}
              onRefresh={() => {
                refetch();
              }}
            />
          )}
        >
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
            parcelTravels={parcelTravelData?.parcelTravels ? parcelTravelData.parcelTravels : []}
          />
        </ScrollView>
        <View style={[styles.footer, styles.spaceBottom]}>
          <Button
            mode="contained"
            onPress={onPressOrder}
            disabled={isDisabled || parcel.arrivedPhoto === null}
          >
            End delivery
          </Button>
        </View>
      </>
    );
  }

  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { hasCameraPermission } = useCameraPermission();

  return (
    <>
      <CameraModal
        hasCameraPermission={hasCameraPermission}
        parcelId={parcel.id}
        status={ParcelStatusEnum.Arrived}
        isOpen={isCameraOpen}
        onHideModal={() => setIsCameraOpen(false)}
        setData={() => {}}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isGetParcelLoading}
            onRefresh={() => {
              refetch();
            }}
          />
        )}
      >
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
          parcelTravels={parcelTravelData?.parcelTravels ? parcelTravelData.parcelTravels : []}
        />
      </ScrollView>
      <View style={[styles.footer, styles.spaceBottom]}>
        <Button
          mode="contained-tonal"
          onPress={() => setIsCameraOpen(true)}
          disabled={isDisabled}
          style={styles.spaceBottom}
        >
          Open Camera
        </Button>
        <Button
          onPress={() => triggerOpenDoor({ id: parcel.id })}
          disabled={isDisabled}
          style={styles.spaceBottom}
        >
          Open Door
        </Button>
      </View>
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(initialError)}
      >
        {error}
      </Snackbar>
    </>
  );
};

export default Arrived;
