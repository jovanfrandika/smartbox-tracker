import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
  Button, Snackbar, Text, TextInput,
} from 'react-native-paper';
import MapView, { Circle, Marker } from 'react-native-maps';

import { Coordinate, Parcel, ParcelStatusEnum } from '../../../types';
import { useAppSelector } from '../../../stores';
import { useSendParcelCodeMutation, useVerifyParcelCodeMutation } from '../../../services/parcel';
import styles from './styles';

import useGetLocation from '../../../hooks/useGetLocation';
import useCountdown from '../../../hooks/useCountdown';
import { useGetAllQuery } from '../../../services/parcelTravel';
import { getCrowInMeters } from '../utils';
import { statusColor } from '../../../constants';
import ParcelInfo from '../components/ParcelInfo';

type Props = {
  parcel: Parcel,
  isLoading: boolean,
  refetch: () => Promise<any>;
};

const initialError = '';
const pollingInterval = 30000;
const destRadius = 150;
const countdown = 60;
const countdownInterval = 1000;

const OnGoing = ({
  parcel,
  isLoading: isGetParcelLoading,
  refetch,
}: Props) => {
  const user = useAppSelector((state) => state.auth.user);

  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError);

  const {
    data: parcelTravelData,
    isLoading: isGetParcelDataLoading,
  } = useGetAllQuery({
    parcelId: parcel.id,
  }, {
    pollingInterval,
  });

  const [
    count,
    start,
  ] = useCountdown(countdown, countdownInterval);

  const [
    triggerSendCode,
    { isLoading: isSendCodeLoading, isError: isSendCodeError },
  ] = useSendParcelCodeMutation({});

  const [
    triggerVerifyCode,
    { isLoading: isVerifyCodeLoading, isError: isVerifyCodeError },
  ] = useVerifyParcelCodeMutation({});

  const mapRef = useRef<MapView | null>(null);

  const parcelTrails = useMemo(() => (
    parcelTravelData?.parcelTravels && parcelTravelData?.parcelTravels.map((deviceDatum, idx) => (
      deviceDatum.coor ? (
        <Marker
          key={`${idx + 1}-${deviceDatum.coor.lat}-${deviceDatum.coor.lng}`}
          title={`${idx + 1}`}
          pinColor={statusColor[ParcelStatusEnum.OnGoing]}
          coordinate={{ latitude: deviceDatum.coor.lat, longitude: deviceDatum.coor.lng }}
        />
      ) : null
    ))), [parcelTravelData]);

  const hasReachEnd = useMemo(() => {
    if (!parcelTravelData || parcelTravelData?.parcelTravels.length === 0) {
      return false;
    }
    const lastTrail = parcelTravelData.parcelTravels[parcelTravelData.parcelTravels.length - 1];
    if (!lastTrail.coor) {
      return false;
    }
    const lastTrailLocation: Coordinate = {
      lat: lastTrail.coor.lat,
      lng: lastTrail.coor.lng,
    };
    const distance = getCrowInMeters(
      lastTrailLocation,
      {
        lat: parcel.arrivedCoor!.lat,
        lng: parcel.arrivedCoor!.lng,
      },
    ) * 1000;
    return distance <= destRadius;
  }, [parcelTravelData]);

  const onPressSendCode = useCallback(async () => {
    const res = await triggerSendCode({ id: parcel.id, toUserId: parcel.receiver!.id });
    if (!('error' in res)) {
      start();
    }
  }, []);

  const onPressVerifyCode = useCallback(async () => {
    const res = await triggerVerifyCode({ id: parcel.id, code });
    if (!('error' in res)) {
      refetch();
    }
  }, [code]);

  const isLoading = isSendCodeLoading
    || isVerifyCodeLoading || isGetParcelLoading || isGetParcelDataLoading;

  useEffect(() => {
    if (isSendCodeError || isVerifyCodeError) {
      setError('Oops, a problem occured');
    }
  }, []);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={(
          <RefreshControl
            refreshing={isGetParcelLoading || isGetParcelDataLoading}
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
          <Circle
            center={{ latitude: parcel.arrivedCoor!.lat, longitude: parcel.arrivedCoor!.lng }}
            radius={destRadius}
            strokeWidth={2}
            strokeColor={statusColor[ParcelStatusEnum.Arrived]}
            fillColor={statusColor[ParcelStatusEnum.Arrived]}
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
          {parcelTrails}
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
      <View style={styles.footer}>
        {parcel.courier?.id === user?.id ? (
          <>
            {count !== countdown && hasReachEnd ? (
              <Text style={styles.textCenter}>
                {`Wait for ${count} second(s)`}
              </Text>
            ) : null}
            <Button
              onPress={onPressSendCode}
              disabled={(count < countdown && count > 0) || !hasReachEnd}
            >
              Send Code to Receiver
            </Button>
          </>
        ) : null}
        {parcel.receiver?.id === user?.id ? (
          <>
            <TextInput
              label="code"
              keyboardType="numeric"
              value={code}
              onChangeText={(newCode) => setCode(newCode)}
              style={styles.spaceBottom}
            />
            <Button
              onPress={onPressVerifyCode}
              disabled={isLoading || code.length < 6}
            >
              Verify Code
            </Button>
          </>
        ) : null}
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

export default OnGoing;
